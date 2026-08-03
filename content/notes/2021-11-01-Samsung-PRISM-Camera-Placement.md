---
title: "Samsung PRISM: Optimal Camera Placement on Stages"
date: 2021-11-01
written: 2026-05-25
assisted: prose
assistedNote: "Written in 2026 about work I did in 2021. The project, the findings and the source material are mine; an LLM drafted the prose from my old project files and notes."
tags:
    - projects
    - computer-vision
    - geometry
    - internship
---

Samsung PRISM (PReparing and Inspiring Student Minds) is a research program where students work on problems Samsung actually cares about. My project: given a stage — a concert, a product launch, any live event — automatically determine the minimum number of cameras and their optimal positions to achieve full coverage, accounting for obstacles like speaker stacks, lighting rigs, podiums, and pillars.

---

## The Problem

A stage is a rectangle. On that stage there are obstacles: speakers stage-left and stage-right, a lighting rig upstage, a podium at center, structural pillars. Cameras can be placed in front of the stage, or on the left/right flanks. Each camera has a field of view (FoV) determined by its lens angle and sensor resolution, and a maximum useful depth `d` beyond which image sharpness degrades below threshold.

The question: how many cameras, placed where, cover every point on the stage that isn't physically blocked by an obstacle?

This is a visibility/coverage problem. The naive answer (just put a camera everywhere) doesn't work when you're trying to minimise equipment. The core constraint is that obstacles cast shadows — a speaker stack blocks everything behind it from a given camera position. Move the camera and the shadow shifts.

---

## Inputs

**Camera parameters:**
```
fov = total_horizontal_resolution / pixel_density   # width the camera sees (metres)
d   = (fov × 360) / (lens_angle × 2π)              # max depth for acceptable sharpness
```

**Stage:** rectangle `(x, y, width, depth)`

**Obstacles:** each defined by bottom-right corner + `(width, depth)`. Four `shapely.LineString` edges built per obstacle: front, back, left, right.

**Object detection output:** Mask-RCNN ran on stage images and classified obstacles into categories — fed directly into the placement algorithm as polygons (more below).

---

## The Geometry Engine

Everything runs in 2D top-down view using [Shapely](https://shapely.readthedocs.io/).

### Camera view model

The camera's visible footprint on the stage floor is modelled as a rectangle:

```python
def camera_view(x, y, pos):
    if pos == 'front':
        view = Polygon([(x-fov/2, y), (x-fov/2, y+d), (x+fov/2, y+d), (x+fov/2, y)])
    elif pos == 'left':
        view = Polygon([(x, y-fov/2), (x+d, y-fov/2), (x+d, y+fov/2), (x, y+fov/2)])
    else:  # right
        view = Polygon([(x-d, y-fov/2), (x, y-fov/2), (x, y+fov/2), (x-d, y+fov/2)])
```

An earlier iteration modelled the view as a triangle (`triangularView()`) — a more accurate frustum representation — but the rectangular approximation was used in the final version for geometric stability with Shapely's polygon operations.

### Blocked area computation

For a camera at `(camX, camY)`, the shadow cast by an obstacle is computed by casting rays from the camera to all four corners of the obstacle and splitting the stage polygon along those rays:

```python
def blockedArea(obs, camX, camY, stage, position):
    A = LineString([(camX,camY), (obs.x1,       obs.y1+obs.d)])  # top-left corner
    B = LineString([(camX,camY), (obs.x1,       obs.y1      )])  # bottom-left
    C = LineString([(camX,camY), (obs.x1+obs.w, obs.y1      )])  # bottom-right
    D = LineString([(camX,camY), (obs.x1+obs.w, obs.y1+obs.d)])  # top-right
    # which two rays form the shadow boundary depends on camera position relative to obstacle
    # split stage polygon along extended rays, return the sub-polygon behind obstacle
```

The `getExtendedLine()` helper is needed because Shapely's `split()` requires lines that span the full bounding box — a finite ray from camera to obstacle corner doesn't reach the stage boundary. The function extends the ray to the bounding box using the line equation `y = kx + m`.

Which two rays define the shadow depends on whether the camera is to the left, right, or directly in front of the obstacle. There are three cases per camera position (front/left/right), giving nine case branches total.

Total blocked area across all obstacles is unioned:
```python
block = Polygon()
for obs in obstacles:
    block = block.union(blockedArea(obs, camX, camY, stage, position))
visible = camera_view(camX, camY, pos).intersection(stage.difference(block))
```

### Two objective functions

**By area:** maximise `visible.area`. Good for general floor coverage.

**By length:** maximise `obsPlot.intersection(visible).length` — the visible perimeter of all obstacle polygons. This prioritises positions that can see around obstacles rather than just empty floor. This was the primary objective in the final version.

### Greedy iterative placement

```python
def place_cameras():
    event_area = Stage
    cameras = []
    while event_area.intersects(obsPlot):  # while any obstacle faces are still uncovered
        camX, camY, pos = optimalPositionByLength(event_area)
        event_area = event_area.difference(camera_view(camX, camY, pos))
        cameras.append([camX, camY, pos])
    return cameras
```

The `camera_placement.ipynb` version added a `0.15 * Stage.area` threshold — the loop stops when remaining uncovered area drops below 15% of total stage area, accepting a small uncovered margin rather than placing a camera for the last sliver.

After the obstacle-covering loop, remaining uncovered area (the "leftover" polygon) is **rectangulated**: decomposed into axis-aligned rectangles using the sight lines from existing camera positions, then each rectangle gets covered by additional cameras sized to it.

### Rectangulation

```python
def isRectangle(poly):
    return math.isclose(poly.minimum_rotated_rectangle.area, poly.area)

# for each leftover polygon, try splitting it using existing camera view boundaries
# until isRectangle() is satisfied, then place basic front/left/right cameras on each rect
```

### Triangulation of irregular regions

For leftover shapes that can't be rectangulated, [Tripy](https://github.com/linuxlewis/tripy)'s ear-clipping algorithm decomposes the polygon into triangles. Before triangulation, edges longer than threshold `d` get intermediate points inserted — ensures the triangle vertices are dense enough for coverage analysis.

---

## Height Module

Separate 2D problem: what height should the camera be mounted at to see over all obstacles on stage?

Given a known `target` obstacle (the deepest/tallest one to see over), and a human height of 1.829m as the minimum useful camera angle, the algorithm:

1. Model the stage cross-section as a side-view (distance vs height)
2. Build `obsPlot` from all obstacle side-view rectangles
3. Starting at `max_height = 1.829 + 0.268 × dist_from_camera`, test increasing camera heights
4. Draw a sight line from `(target_dist, target_height)` to `(0, h)` (camera at height h)
5. Find the minimum `h` where `line.touches(obsPlot)` — i.e., the line just clears all obstacles

```python
for h in range(math.ceil(max_height), target_height):
    line = LineString([(target_dist, target_height), (0, h)])
    if line.touches(obsPlot):
        camZ = h
        break
```

If no clear sightline exists from in front of the obstacle, the algorithm retries from behind the obstacle's back edge.

---

## Illumination Module

Given a camera image of the stage, score how well-lit each region is.

**K-means on intensity histogram:**
- PIL loads image as grayscale → numpy array
- Build 256-bin histogram
- Run 2-centroid k-means on histogram bins (weighted by pixel count, not individual pixels)
- Centroid update: `new_centroid = Σ(intensity × pixel_count) / Σ(pixel_count)` for all bins assigned to that centroid
- Classify each pixel as lit/unlit based on which centroid its intensity is closest to
- Evaluate against ground-truth mask: compute TPR, FPR, F-score

```python
centroid1_avg = int(sum1) / sum(w1_centroid)  # weighted mean intensity of cluster 1
```

**Iterative illumination scoring:**
- Model stage as a 2D grid (each cell ~1m²)
- Each cell gets illumination value from the camera feed (simulated as random 0/1 in testing)
- `Point` class: stores x, y; static methods `angle(a, b)` and `distance(a, b)`
- Score a camera position by counting how many grid cells within `recog_dist = int(d)` are lit
- Used to post-process the placement output: adjust camera positions for illumination if needed

**`demo.py`:** standalone script that runs the illumination module against a sample stage image and prints the score.

---

## Object Detection: Mask-RCNN

Used Mask-RCNN (not bounding boxes — segmentation masks are needed to model the obstacle polygon shape accurately for the shadow computation).

**Two datasets collected:**

Dataset 1 (zip 1):
- `Objects of Interest/podium/` — ~50 images
- `Obstacles/speaker/` — speaker stacks (filenames are Unix timestamps, Oct 2021)
- `Obstacles/light/` — stage lighting rigs

Dataset 2 (zip 2, final submission):
- `Objects of Interest/chair/` — ~50 images of chairs on stage
- `Objects of Interest/mic/` — microphone stands
- `Obstacles/pillar/` — structural columns (~50 images)
- `Obstacles/speaker/`, `Obstacles/light/` — same as above

The final dataset added pillars (structural columns) as a new obstacle class and chairs/mics as objects of interest — presumably from feedback that the initial categories weren't sufficient for real venues.

Mask-RCNN trained with a custom config (`custom_config.py`). Training logs present under `MaskRCNN-Custom-train/logs/object2021062...` — training was run in June 2021.

The segmentation masks from inference are converted to Shapely polygons and passed into `place_cameras()` as the obstacle list.

---

## Stage Dimension Extraction

`Get Stage Dimension.ipynb` — extracts stage width/depth from a single photo:
- Gaussian blur → Canny edge detection → Probabilistic Hough Transform
- Filter for longest parallel line pairs → stage boundary candidates
- Estimate real-world dimensions from line pixel lengths + known camera parameters

```python
edges = cv2.Canny(blurred, 50, 150)
lines = cv2.HoughLinesP(edges, 1, np.pi/180, 50, minLineLength=50, maxLineGap=10)
for line in lines:
    x1, y1, x2, y2 = line[0]
    length = math.sqrt((y2-y1)**2 + (x2-x1)**2)
```

Contour-based approach also explored: `cv2.findContours` + `cv2.arcLength` to find the stage perimeter directly.

---

## UI

`final_w_UI.ipynb` included a PyQt5 canvas for manually drawing obstacles on stage:

```python
class MyApp(QWidget):
    def mouseReleaseEvent(self, event):
        # convert pixel coords to stage metres using scale_factor
        x1, y1 = int(self.begin.x()/scale_factor)+x, int(stage_depth-self.begin.y()/scale_factor)+y
        w = int((self.destination.x()-self.begin.x())/scale_factor)
        d = int((self.begin.y()-self.destination.y())/scale_factor)
        obstacles.append(Obstacle(x1, y1, w, d))
```

The canvas renders at `scale_factor=20` (20 pixels per metre). User draws rectangles to define obstacles; these feed the same placement algorithm as the Mask-RCNN detections.

---

## Known Limitations (from the notebooks)

The `final_approach.ipynb` explicitly notes:
- Front/left/right placement zones don't cover all configurations — **back cameras are sometimes needed** but weren't implemented
- **Shapely is 2D only** — the camera placement runs in the floor plane; height is handled separately by the height module, not jointly optimised
- The greedy algorithm is not globally optimal — it places the locally-best camera at each step, which doesn't guarantee the minimum total camera count

---

## Stack

| Component | Library |
|---|---|
| 2D geometry + visibility | `shapely`, `geopandas` |
| Polygon triangulation | `tripy` (ear-clipping) |
| Object detection | Mask-RCNN (custom-trained, June 2021) |
| Edge/line detection | `cv2.Canny`, `cv2.HoughLinesP`, `cv2.findContours` |
| Illumination clustering | k-means on histogram (PIL + numpy) |
| UI for obstacle drawing | PyQt5 |
| Visualisation | `matplotlib`, `geopandas` |
