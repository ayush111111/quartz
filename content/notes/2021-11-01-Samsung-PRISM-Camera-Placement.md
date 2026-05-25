---
title: "Samsung PRISM: Optimal Camera Placement on Stages"
date: 2021-11-01
tags:
    - computer-vision
    - geometry
    - internship
---

Samsung PRISM (Platform for Research Innovation in Samsung Mobiles) is a research program where students work on problems Samsung actually cares about. My project: given a stage — a concert, a product launch, any live event — automatically determine the minimum number of cameras and their optimal positions to achieve full coverage, accounting for obstacles like speaker stacks, lighting rigs, and podiums.

---

## The Problem

A stage is a rectangle. On that stage there are obstacles: speakers stage-left and stage-right, a lighting rig upstage, a podium at center. Cameras can be placed in front of the stage, or on the left/right flanks. Each camera has a field of view (FoV) determined by its lens angle and sensor resolution, and a maximum useful depth `d` beyond which image sharpness degrades below threshold.

The question: how many cameras, placed where, cover every point on the stage that isn't physically blocked by an obstacle?

This is a visibility/coverage problem. The naive answer (just put a camera everywhere) doesn't work when you're trying to minimize equipment. The interesting constraint is that obstacles cast shadows — a speaker stack in the front-left blocks everything behind it from a front-facing camera, depending on where that camera sits.

---

## Inputs

**Camera parameters (derived from hardware specs):**
```
fov = total_horizontal_resolution / pixel_density   # width camera sees at distance d
d   = (fov × 360) / (lens_angle × 2π)              # max depth for acceptable sharpness
```

**Stage:** rectangle defined by (x, y, width, depth)

**Obstacles:** each defined by bottom-right corner + (width, depth). The system builds four `shapely.LineString` edges per obstacle (front, back, left, right).

**Object detection output:** Mask-RCNN ran on stage images to detect and classify obstacles into: `podium`, `speaker`, `light`. The detections feed directly into the placement algorithm as obstacle polygons.

---

## The Geometry Engine

Everything runs in 2D top-down view using [Shapely](https://shapely.readthedocs.io/).

### Blocked area computation

For a camera at `(camX, camY)` looking at an obstacle, the shadow is the region behind the obstacle from the camera's perspective. Computed by casting rays from the camera to the four corners of the obstacle and splitting the stage polygon along those ray lines.

```python
def blockedArea(obs, camX, camY, stage, position):
    A = LineString([(camX,camY), (obs.x1,       obs.y1+obs.d)])
    B = LineString([(camX,camY), (obs.x1,       obs.y1      )])
    C = LineString([(camX,camY), (obs.x1+obs.w, obs.y1      )])
    D = LineString([(camX,camY), (obs.x1+obs.w, obs.y1+obs.d)])
    # split stage by extended ray lines, keep the sub-polygon behind obstacle
    ...
```

The `getExtendedLine()` helper extends a finite line segment to the bounding box of the stage — necessary because Shapely only splits polygons with infinite-length lines.

The total blocked area from all obstacles is unioned:
```python
block = union(blockedArea(obs, camX, camY) for obs in obstacles)
visible = camera_view(camX, camY).intersection(stage.difference(block))
```

### Camera placement: two objective functions

**By area:** find the position that maximises `visible.area`. Good for general coverage.

**By length:** find the position that maximises `obsPlot.intersection(visible).length` — the visible perimeter of the obstacle polygons themselves. This prioritises positions that can see around obstacles, not just empty floor.

```python
def optimalPositionByLength(stage):
    for each candidate camera position (front/left/right zones):
        block = totalBlockedArea(camX, camY, stage, position)
        visible = camera_view(camX, camY, position).intersection(stage.difference(block))
        score = obsPlot.intersection(visible).length
        # keep argmax
```

### Iterative placement

The full algorithm places cameras one at a time:

```python
def place_cameras():
    event_area = Stage
    cameras = []
    while event_area.intersects(obsPlot):   # while obstacles still have uncovered faces
        camX, camY, pos = optimalPositionByLength(event_area)
        event_area = event_area.difference(camera_view(camX, camY, pos))
        cameras.append([camX, camY, pos])
    return cameras
```

After the obstacle-facing positions are covered, remaining uncovered area (the leftover polygon) is rectangulated: decomposed into rectangles using the existing camera view boundaries, then covered with additional cameras sized to each rectangle.

### Triangulation

For non-rectangular leftover regions (the stage minus all camera views isn't always rectangulable), [Tripy](https://github.com/linuxlewis/tripy)'s ear-clipping algorithm decomposes the polygon into triangles. Dense edge sampling (inserting intermediate points on edges longer than threshold `d`) ensures the triangulation is fine-grained enough for coverage analysis.

---

## Illumination Module

Separate from placement: given a camera image of the stage, score how well-lit each region is.

**K-means on intensity histogram:** PIL loads the image as grayscale. A 2-centroid k-means runs on the pixel intensity histogram (not on individual pixels — on the histogram buckets, weighted by pixel count). This segments the image into "well-lit" and "poorly-lit" clusters. The centroid update:

```python
centroid1_avg = sum(intensity × pixel_count for i in cluster1) / total_pixels_in_cluster1
```

Evaluated against a ground-truth mask using TP/TN/FP/FN → TPR, FPR, F-score.

**Iterative illumination scoring:** models the illumination as a 2D grid over the stage (each cell = 1m²). Each cell gets a random illumination value (0 or 1) in simulation; in real use it comes from the camera feed. Camera positions are scored by the fraction of stage area they see at acceptable illumination, with a `Point` class handling angle and Euclidean distance calculations. Max usable range is set by `recog_dist = int(d)`.

---

## Object Detection: Mask-RCNN

The obstacle pipeline uses Mask-RCNN (not YOLO — YOLO was FMD; here we needed segmentation masks, not just bounding boxes, to accurately model the obstacle polygon shape).

**Dataset:** custom-collected images of:
- `podium/` — ~50 images of podiums on stage
- `speaker/` — speaker stacks (timestamps in filenames: `1633334214450.jpg` etc., collected Oct 2021)
- `light/` — stage lighting rigs

Mask-RCNN trained on this dataset outputs segmentation masks; those masks are converted to Shapely polygons and passed to the placement algorithm as obstacles.

A custom training config was built on top of the standard Mask-RCNN codebase (`custom_config.py` under `MaskRCNN-Custom-train`).

---

## Stage Dimension Extraction

A separate module (`Get Stage Dimension.ipynb`) extracts stage dimensions from a camera image:
- Canny edge detection on a Gaussian-blurred grayscale image
- Probabilistic Hough Line Transform (`cv2.HoughLinesP`) with `minLineLength=50`, `maxLineGap=10`
- Lines are filtered and the longest parallel pairs taken as stage boundaries
- Stage width/depth estimated from line lengths and known camera parameters

```python
edges = cv2.Canny(blurred, 50, 150)
lines = cv2.HoughLinesP(edges, 1, np.pi/180, 50, minLineLength=50, maxLineGap=10)
```

---

## Final Deliverable

The final app (`Current Working App/`) combined all modules:

1. User inputs stage dimensions (or system extracts them from image)
2. Camera image fed to Mask-RCNN → obstacle polygons
3. Camera placement algorithm runs → outputs `[(x, y, position)]` list
4. Illumination scoring overlaid on placement output
5. Height adjustment recommendations based on stage depth and camera angle

The height adjustment module (`Height Adjustment Module.pdf`) handled the 2D → 3D conversion: given a camera height h and its horizontal position, compute the actual area it covers at ground level accounting for the angle of depression — ensuring the 2D FoV model remained valid.

---

## Stack

| Component | Library |
|---|---|
| 2D geometry | `shapely`, `geopandas` |
| Polygon triangulation | `tripy` (ear-clipping) |
| Object detection | Mask-RCNN (custom-trained) |
| Edge/line detection | `cv2.Canny`, `cv2.HoughLinesP` |
| Illumination clustering | k-means on histogram (PIL + numpy) |
| Visualisation | `matplotlib`, `geopandas` plots |
| UI | Jupyter notebook (`UI.ipynb`) |
