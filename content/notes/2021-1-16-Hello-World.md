---
title: "PID Control line follower"
date: 2021-01-16
tags:
  - robotics
  - control-systems
  - computer-vision
---

Follow line behaviour in a Formula-1 car, using images as input
It has two controllers, for rotation and speed.

## Image Processing
### 1. Colour filtering

* The red line present on the formula track is to be followed.


* A "mask" is developed using the RGB (or hsv) values of the input image are thresholded such that only red colour is highlighted.


* Overlaying this mask over the input image gives us a red coloured blob representing the line to be followed.


### 2. Finding a single point to be tracked

* A single point (or a line) is considered as an ideal "set" point which represents the direction in which the car should be going to find this point, the concept of moments in OpenCV is used


* Definition of moments in [image processing is borrowed from physics](https://stackoverflow.com/questions/22470902/understanding-moments-function-in-opencv). Assume that each pixel in image has weight that is equal to its intensity. Then the point you defined is centroid (a.k.a. center of mass) of image.


* Assume that I(x,y) is the intensity of pixel (x,y) in image. Then m(i,j) is the sum for all possible x and y of: I(x,y) * (x^i) * (y^j).


* The error value is calculated by the difference in x and y values of the set point and the centre of the frame at the bottom of the input image.




_input image along with red line and set point_

[![camera feed along with processed image](https://yt-embed.herokuapp.com/embed?v=4kmUJu2Xqlg)](https://www.youtube.com/watch?v=4kmUJu2Xqlg "camera feed along with processed image")

---

## PID control
### 1. P control
* Generates a signal that is directly proportional to the error, with the multiplying factor being Kd. However, the value signal often ends up oscillating around the desired value.
	
### 2. I control
* The offset error accumulated by the P control can be removed using the I control (Integrator).
    			integral error = previous integral error + current error
                
### 3. D control
* The overshooting of the desired signal can be reduced by using D control (differentiator). The change in error is multiplied by Kd to give the requiered output.
 
 
 
[_video by MATLAB explaining PID_](https://www.youtube.com/watch?v=wkfEZmsQqiA)
 
 
_this video demonstrates the use of PD control_


[![gazebo simulation of Formula Car](https://yt-embed.herokuapp.com/embed?v=PHs2H54jiRc)](https://www.youtube.com/watch?v=PHs2H54jiRc "gazebo simulation of Formula Car")

---

### **above project is a solution to exercise problems on [JDE Robotics Academy](http://jderobot.github.io/RoboticsAcademy/)**