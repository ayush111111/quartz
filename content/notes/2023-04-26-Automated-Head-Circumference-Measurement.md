---
title: "Automated Head Circumference Measurement"
date: 2023-04-26
tags:
  - machine-learning
  - medical-imaging
  - computer-vision
---


The growth and development of the fetal head and brain during pregnancy are crucial for the child's long-term health and well-being. However, fetal ultrasound images are prone to variations due to patient-specific factors and image issues such as signal dropouts, artifacts, and missing boundaries. Hence, there is a need for automatic methods to ensure accurate and consistent measurements of fetal head and brain growth


<!--

EfficientNet-Unet is a neural network architecture designed for semantic segmentation tasks, which combines the EfficientNet architecture for feature extraction with the UNet architecture for segmentation. In this architecture, the encoder part of the EfficientNet is replaced by the contracting path of the UNet, which consists of a series of convolutional and max pooling layers to downsample the input image and capture its features. The expansive path of the UNet is then used to upsample the feature map and generate pixel-level segmentation masks.


The EfficientNet-Unet architecture leverages the efficient feature extraction capabilities of the EfficientNet, which allows it to achieve state-of-the-art performance on image classification tasks, and combines it with the powerful segmentation capabilities of the UNet, which allows it to generate accurate segmentation masks with fewer parameters and faster inference times.

Below graph summarizes the training of EfficientNet Unet over 100 epochs.  
<p align="center">
  <img src="/epochVsLoss.png" alt="Epoch Vs Loss.">
</p>
Predictions on the test set were made and their dice scores were calculated. Their distribution is represented below with a histogram and a boxplot.
<p align="center">
  <img src="/distributionTest.png" alt="distribution of Test set scores">
</p>
Median dice score of 0.9889 was obtained the test dataset (10% of total [dataset](https://zenodo.org/record/1322001))
-->
<a href="https://api.wandb.ai/links/ayush111111/pnqqlf8o" target="_blank">View graphs on WandB</a>

Hyperparameter tuning performed using KerasTuner

Paper: [Automating UNet Architecture Search for Fetal Head Segmentation](notes/Automating-UNet-Architecture-Search-for-Fetal-Head-Segmentation.pdf)

Accepted at TENCON 2026; author's accepted version

<iframe src="notes/Automating-UNet-Architecture-Search-for-Fetal-Head-Segmentation.pdf" width="100%" height="800" style="border: 1px solid var(--lightgray);"></iframe>

Application: <https://aaylmao-hc-prediction.hf.space/>

<script type="module" src="https://gradio.s3-us-west-2.amazonaws.com/3.27.0/gradio.js"></script>
<gradio-app src="https://aaylmao-hc-prediction.hf.space"></gradio-app>

