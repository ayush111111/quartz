---
title: "Building Perception for a Driverless Formula Car"
date: 2021-08-15
written: 2026-05-25
assisted: prose
assistedNote: "Written in 2026 about work I did in 2020–21. The project, the findings and the source material are mine; an LLM drafted the prose from my old project files and notes."
tags:
    - robotics
    - computer-vision
    - autonomous-systems
---

In 2019, Manipal's Formula Student team spun up a driverless subsystem from scratch — ten students, no prior codebase, and a Formula Student car that needed to navigate a cone-marked track without a driver. I joined the Perception division and spent the next two years building the pipeline that told the car where the cones were.

We won the Ather Energy Software Award at Formula Bharat two years running. This is what that work actually looked like.

---

## Onboarding (Feb–Apr 2020)

Before touching any perception code, the first two months were structured research and learning tasks.

**Sensor survey (Feb 20):** Covered the full AV sensor stack — ultrasonic (ToF, 20–40 kHz, short range), FMCW RADAR (chirp-based, FFT for multi-object ranging, good in all weather), LiDAR (pulsed ToF, 2D vs 3D, rotary vs solid-state), cameras (CCD vs CMOS, global vs rolling shutter, mono vs stereo, IR/ToF variants), IMU (gyros + accelerometers, odometry + slip angle estimation), GNSS/RTK (satellite ToF for absolute position, RTK adds a fixed base station for 1–2cm accuracy in fixed mode vs 0.75–0.2m in float mode).

**Sensor comparison (Feb 26):** The core tradeoff: LiDAR is accurate and lighting-independent but expensive, limited range (~70–100m), slower refresh, degraded in heavy rain/snow. Cameras are cheap, high-resolution, see colour, but need illumination, are compute-heavy, and struggle with shadows and lighting variation. The takeaway for FMD: use LiDAR as the primary depth sensor and cameras for classification, colour, and extended range — each covering the other's failure modes.

**Localisation (Mar 1):** Studied the three main approaches used in autonomous cars:
- **Odometry:** wheel displacement + starting position → accumulated position estimate. Drifts badly due to wheel slip.
- **Particle filters:** scatter N particles across the map, weight by sensor-vs-landmark match, resample toward high-weight particles. Accurate but slow with many particles; requires a pre-built map.
- **Kalman filter:** two-step predict/update cycle. State extrapolation + covariance extrapolation (prediction), then state update + covariance update using Kalman Gain (measurement weighting). For nonlinear systems: **EKF** (Extended Kalman Filter) linearises via Jacobians at each timestep; **UKF** (Unscented Kalman Filter) uses the unscented transform for statistical linearisation — more accurate in highly nonlinear cases but more compute than EKF.

**ROS tasks (Mar–Apr):** Three onboarding tasks before joining live development — a three-tier ROS publish/subscribe architecture, Gazebo simulation with a kinect depth camera + OpenCV display, and a face detection pipeline using Haar cascades with coordinates passed as custom messages between nodes. Common early gotcha: turtlebot ignoring `/velocity` topic, responding only to `/cmd_vel`.

**Deep learning (Apr 11):** Completed deeplearning.ai CNN course on Coursera; implemented YOLO as the week 3 assignment of course 4 (Keras + TensorFlow backend). This was the direct prerequisite for joining the camera perception pipeline.

---

## The Problem

Formula Student Driverless tracks are laid out with colored cones: yellow on the left boundary, blue on the right. The car needs to know where every cone is in 3D space, in real time, reliably enough that the planning and control stack can act on it. Miss a cone and the car cuts a corner. Get the position wrong by enough and the path planner generates a trajectory that doesn't match the actual track.

The system needs to be redundant. If one sensor fails mid-run, the car should continue on the other. That meant two independent pipelines — LiDAR and camera — fused together.

---

## Hardware

**LiDAR:** Velodyne VLP-16 Hi-res. Range tops out at ~5-6 meters for reliable cone detection before beam divergence degrades point density too much.

**Cameras:**
- Stereo pair, **5.5mm focal length** — short focal length for a wider FoV, handles nearby cone triangulation accurately
- Monocular, **longer focal length** — acts as a magnifier for distant cones, extending the effective perception range ~5-6m beyond the LiDAR limit to ~15m total from the camera system

**Camera specs (both):** CMOS sensors (not CCD — CMOS handles glare and sudden lighting changes better; CCD gets washed out). Global shutter, not rolling shutter — at racing speeds, rolling shutter distorts fast-moving objects badly. Polarized filters mounted on the housing.

**State estimation sensors (feed the SLAM module, not perception directly):**
- Resolvers — angular speed at each wheel
- Ground speed sensor
- Dual-antenna INS (inertial navigation system)
- Steering angle sensor
- Motor torque sensor
- **IMU** — gyros + accelerometers for pitch/roll/heading and slip angle estimation; used with odometry to compensate for wheel slip
- **GNSS/RTK** — absolute position to 1–2cm in fixed mode; used for loop closure verification in SLAM mode

---

## System Architecture

Two operating modes:

1. **SLAM mode (first lap):** Car drives slowly while perception feeds cone observations to a SLAM module. The SLAM module fuses LiDAR and camera observations with velocity estimates to build a cone map as landmarks. Path planning uses Delaunay triangulation on cone observations to extract the track centerline. Control runs a pure pursuit controller (constant linear velocity, chases a lookahead point). Accuracy matters more than speed here.

2. **Localisation mode (subsequent laps):** Once the first lap closes (loop closure), the map is frozen. Perception still runs but feeds a localisation-only mode. Control switches to a nonlinear MPC (NMPC) which optimizes trajectories over a finite time horizon for maximum lap speed.

A two-stage sensor failure detection system monitors both LiDAR and camera observations and penalises measurements that deviate significantly from recent history, preventing a malfunctioning sensor from poisoning the map.

**SLAM state estimation internals:** The SLAM module uses an EKF (Extended Kalman Filter) to fuse cone observations with velocity estimates. The EKF linearises the nonlinear vehicle motion model via Jacobians at each timestep — necessary because the predict step involves trigonometric functions (heading angle) that are nonlinear. Kalman Gain weights the relative trust between the motion prediction and the sensor measurement: high gain → more weight to new measurements (responsive but noisy), low gain → smoothed estimate (stable but slow to update).

---

## LiDAR Pipeline

### Preprocessing
Raw VLP-16 scans have motion distortion — because the car is moving while the lidar is spinning, each point in the scan is captured from a slightly different car position. This is compensated using velocity estimates from the INS before any processing.

### Ground Removal
An **adaptive ground control algorithm** divides the point cloud into angular segments. Within each segment it finds the lowest point and fits a line representing the ground plane. Points within a threshold distance of that line are classified as ground and removed.

Problem: cone base points are close to the ground plane and get incorrectly removed. Fix: before ground removal, construct a small cylinder around each candidate cone cluster. Points inside these cylinders are protected from ground removal, then classified and used for colour estimation.

### Cone Detection
After ground removal, remaining points are clustered. Each cluster is checked against cone geometry (height ~0.23m for small cones, ~0.5m for large, cross-section consistent with a truncated cone). Valid clusters have a small cylinder reconstructed around them.

### Colour Estimation
Yellow-black-yellow (left boundary) and blue-white-blue (right boundary) cones have different LiDAR intensity signatures — the colour bands reflect differently. A CNN takes a **32×32 grayscale image** built from the cluster's intensity values (with pixel values adjusted to emphasise intensity differences) and outputs probabilities over {blue, yellow, unknown}.

---

## Camera Pipeline

### Cone Detection: YOLOv3
YOLOv3 runs on each camera frame. Trained on an open-source cone dataset with varied illumination and weather for robustness.

How YOLOv3 works here: divides image into S×S grid. Each cell predicts B bounding boxes, each with (x, y, w, h, confidence), plus one set of class probabilities per cell (`P(class | object)`, conditional — suppressed if no object present). One class probability set per cell regardless of number of boxes.

Output: bounding boxes around cones in 2D image space.

### 3D Pose from a Single Image: PnP

A cone is a rigid object with known geometry. A neural network regresses on **7 keypoints** `[u, v]` in the image plane within each detected bounding box. Loss function uses the cross-ratio for geometric consistency.

Those 7 keypoints, combined with their known 3D positions on the cone model (world coordinates), are fed to `cv2.solvePnP` with `SOLVEPNP_ITERATIVE` + RANSAC:

```python
ret, rvec, tvec = cv2.solvePnP(
    objpoints,           # 3D cone keypoints in world frame
    np.array(imgpoints), # 2D detected keypoints in image
    camMatrix,
    distCoeffs=None,
    flags=cv2.SOLVEPNP_ITERATIVE
)
```

**Output:** `rvec` (rotation in Rodrigues form) + `tvec` (translation). Together these form the extrinsic matrix `[R | t]`.

**Coordinate pipeline:**
```
3D world coords [X, Y, Z, 1]
    → multiply by [R | t]  (extrinsic)
    → 3D camera coords
    → multiply by K (intrinsic: focal length, optical centre)
    → 2D image coords [u, v]
```

To get the 3D position of a cone: run this in reverse. The `tvec` output gives the translation of the cone's reference frame origin in camera coordinates.

**Getting 3D position from keypoints:**
```python
point = np.dot(objpoints[a], rvec) + np.matrix.transpose(tvec)
```

**Why iterative PnP + RANSAC over alternatives:**
- P3P: uses exactly 3 points, discards most correspondences, closed-form but unstable
- EPnP: linear in number of correspondences, more efficient, but overkill for 7 points
- DLT: solves a linear system, degenerates for planar point configurations
- Iterative nonlinear PnP (chosen): fast for 7 points, uses all correspondences, + RANSAC handles outlier keypoints

**⚠ Coordinate system gotcha:** OpenCV and Hartley-Zisserman use different conventions. OpenCV: x right, y down, z into scene. H&Z: x right, y up, z out of scene. Getting this wrong produces 3D positions that are numerically plausible but physically wrong.

### Stereo Bounding Box Propagation

Once we have the 3D position of a cone from the left camera, we need to find the corresponding bounding box in the right camera's image — without running YOLO a second time.

From `cv2.stereoCalibrate()` we get R (rotation between left and right camera coordinate systems) and T (translation between them).

```python
# Transform 3D point from left camera frame to right camera frame
point_right_3d = np.dot(objpoints[a], R) + T.T

# Project into right image plane
point_right_2d = intrinsic_matrix @ point_right_3d
point_right_2d /= point_right_2d[2]  # normalise homogeneous
```

In practice: **10-15 pixel error** between projected point and actual cone location in the right image. This is tightened by adding disparity constraints and epipolar geometry constraints.

**Epipolar geometry:** A point `x` in the left image must lie on the epipolar line `l' = F·x` in the right image, where F is the fundamental matrix. Rather than searching the whole right image for matching features, we search only along this line.

- **Essential matrix E:** encodes R and T between cameras in global/normalised coordinates
- **Fundamental matrix F:** encodes the same information plus intrinsics — relates points in pixel coordinates across the two images. `F = K'^{-T} · E · K^{-1}`

F is computed from the matched point pairs obtained during stereo calibration via `cv2.stereoCalibrate()`. Epipolar lines are computed with `cv2.computeCorrespondEpilines()`.

### Feature Matching and Triangulation

For the stereo pair, after propagating bounding boxes to the right image, we triangulate to get 3D positions:

1. **Feature detection:** SIFT (`cv2.SIFT_create()`) on both bounding box crops
2. **Matching:** `cv2.BFMatcher(cv2.NORM_L2, crossCheck=True)` — L2 (Euclidean) distance for SIFT descriptors; crossCheck enforces mutual best-match
3. **Triangulation:** `cv2.triangulatePoints()` — returns homogeneous 4D coordinates, divide by w to get Euclidean 3D

Early issue: bounding box approximation quality directly affects triangulation accuracy. Tight bounding boxes → better matched regions → better triangulation. We also investigated BRISK alongside SIFT.

---

## Camera Calibration

Done in Gazebo simulation before touching the physical rig. Using a virtual checkerboard:

```
cd catkin_build_ws
source install/setup.bash --extend
# run camera_calibration package for stereo
```

Key packages: `image_pipeline` (camera calibration), `generic_message_serializer` (for publishing checkerboard position in sim).

Calibration outputs per camera: **camera matrix K** (focal lengths fx, fy, principal point cx, cy) and **distortion coefficients**. For stereo: additionally R, T, E, F between the two cameras.

Post-calibration, `cv2.getOptimalNewCameraMatrix()` + `cv2.undistort()` removes lens distortion from every frame before the pipeline runs.

ROS camera info format: `sensor_msgs/CameraInfo` — stores K, D, R, P matrices.

---

## ROS Setup

Everything runs in ROS. Key notes:
- Motion distortion compensation happens before anything else in the LiDAR pipeline
- Camera nodes publish raw + rectified image topics
- Perception outputs cone positions + colour as custom ROS messages, subscribed to by the SLAM module
- Topic names matter: early debugging found the turtlebot simulator ignoring `/velocity` but responding to `/cmd_vel`

---

## Things That Took Longer Than Expected

**Coordinate frame debugging.** `solvePnP` outputs are easy to misread. `rvec` is Rodrigues form, not Euler angles. `tvec` is the position of the world origin in camera coordinates, not the camera in the world. Multiple pipeline bugs traced back to this.

**Bounding box quality → triangulation quality.** The tighter and more accurate the YOLOv3 bounding box, the better the SIFT features matched across stereo images, the better the triangulated 3D position. Improving bounding box quality had outsized downstream effects.

**Simulation vs real calibration.** The Gazebo checkerboard calibration caught intrinsic estimation issues before we touched the physical cameras. Saved significant time not debugging optics and algorithms simultaneously.

**Colour cone estimation edge cases.** The LiDAR CNN colour classifier needed intensity preprocessing to make the blue/yellow signatures distinguishable. Raw intensity values had too much overlap.

---

## Team and Role

The driverless subsystem started with ten people. The perception work split between LiDAR and camera subgroups; I ended up owning the monocular and stereo camera pipelines end to end. Later I ran recruiting and onboarding for new perception members — the structured path I had gone through (sensors → localisation → ROS → deep learning → live pipeline) became the template. Explaining epipolar geometry to a first-year who had never touched OpenCV turned out to be as formative as the technical work itself.

---

## References

- [Real-time 3D Pose Estimation with a Monocular Camera (AMZ, arXiv:1809.10548)](https://arxiv.org/pdf/1809.10548.pdf)
- [Stereo Vision Pipeline (arXiv:1809.10099)](https://arxiv.org/pdf/1809.10099.pdf)
- [OpenCV camera calibration docs](https://docs.opencv.org/2.4/modules/calib3d/doc/camera_calibration_and_3d_reconstruction.html)
- [CVonline: Epipolar Geometry](https://homepages.inf.ed.ac.uk/rbf/CVonline/LOCAL_COPIES/YOUNG/vision5.html)
- [OpenCV: solvePnP output interpretation](https://answers.opencv.org/question/66608/what-represents-the-output-of-solvepnp/)
- [OpenCV: epipolar geometry tutorial](https://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_calib3d/py_epipolar_geometry/py_epipolar_geometry.html)
- [Head pose estimation with PnP (learnopencv)](https://www.learnopencv.com/head-pose-estimation-using-opencv-and-dlib/)
