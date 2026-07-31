---
title: "Bayesian Optimization"
date: 2026-07-31
tags:
  - bayesian-optimization
  - gaussian-processes
  - hyperparameter-tuning
  - probability
  - machine-learning
---

BO is a powerful method to find the optimum of a black box function that is expensive to evaluate. It is especially useful to optimize functions that are computationally expensive to evaluate (e.g hyperparameter tuning)

### Components of BO

#### 1. Objective function `f(x)`

This is the black box function that is to be maximized or minimized for the inputs $x$.

#### 2. Surrogate Model

This model approximates the value of $f(x)$ to reduce the number of evaluations. It balances between exploration (focusing on new areas) and exploitation (finding new areas that provide better results)

##### Gaussian process

They provide a measure for uncertainty for predictions.

> [!question]- Why GPs?
> GPs predict the mean (expected value) as well as the confidence interval (variance) around the prediction
>
> **Exploration** involves focusing on stages with high uncertainty
>
> **Exploitation** involves focusing on better expected values
>
> Hence, they are commonly used as surrogate models

###### but *w h y* do they work?

**1. What are Gaussian Processes?**

A stochastic process is a collection of random variables that are indexed by some parameter, typically **time** or **space**. It is a way to describe phenomena that evolve over time or space in a way that includes randomness. (e.g a stock)

A stochastic process is Gaussian if **every finite collection of random variables in the process follows a multivariate normal (Gaussian) distribution**.

This means we can describe the process entirely using its mean and covariance functions.

These functions are "smooth" in a way determined by the covariance function $k(x,x')$, which encodes assumptions about how outputs $f(x)$ and $f(x')$ are related.

For example:

- If $k(x,x')$ is large when $x$ and $x'$ are close, $f(x)$ will change smoothly between $x$ and $x'$.
- If $k(x,x')$ is small, $f(x)$ at $x$ and $x'$ are weakly correlated.

**2. What are Kernel functions?**

A **kernel function** is a mathematical function that computes the "similarity" or "correlation" between two inputs $x$ and $x'$ in the input space.

In GP, It defines how the outputs are related or correlated based on the inputs.

**3. Prior and Posterior in GPs**

*Prior*

In a gaussian process, the prior states that the function values follow a multivariate gaussian distribution. If two inputs are very similar, the kernel gives them a high covariance, meaning their outputs are likely to be similar too.

*Posterior*

Calculated when data is observed. It is the updated understanding of the function. For a new input $x^*$ we predict the most likely output (mean) and estimate how uncertain we are about that prediction (variance)

**4. Gaussian Process Formula**

The GP assumes a **joint Gaussian distribution** for the observed values $f(X)$ and the unknown value $f(x^*)$:

$$
\begin{bmatrix} f(X) \\ f(x^*) \end{bmatrix} \sim \mathcal{N}\left( \begin{bmatrix} m(X) \\ m(x^*) \end{bmatrix}, \begin{bmatrix} K(X,X) + \sigma^2 I & K(X,x^*) \\ K(x^*,X) & K(x^*,x^*) \end{bmatrix} \right)
$$

Where:

- $m(X)$: Mean function (often $0$).
- $K(X,X)$: Covariance matrix for observed inputs, calculated using the kernel.
- $K(X,x^*)$: Covariance vector between observed inputs and $x^*$.
- $K(x^*,x^*)$: Variance at $x^*$.
- $\sigma^2 I$: Noise term for observed data (e.g., measurement noise).

This is derived from the rules of conditional distribution of multivariate gaussians

$$x \sim \mathcal{N}(\mu, \Sigma)$$

> [!abstract]- The conditioning rule, written out
> For two variables, $X_1$ and $X_2$, jointly distributed as:
>
> $$
> \begin{bmatrix} X_1 \\ X_2 \end{bmatrix} \sim \mathcal{N}\left( \begin{bmatrix} \mu_1 \\ \mu_2 \end{bmatrix}, \begin{bmatrix} \sigma_1^2 & \rho\sigma_1\sigma_2 \\ \rho\sigma_1\sigma_2 & \sigma_2^2 \end{bmatrix} \right)
> $$
>
> Where:
> - $\mu_1, \mu_2$: Means of $X_1$ and $X_2$.
> - $\sigma_1^2, \sigma_2^2$: Variances of $X_1$ and $X_2$.
> - $\rho$: Correlation coefficient between $X_1$ and $X_2$.
>
> $$X_1 \mid X_2 \sim \mathcal{N}\left(\mu_{X_1 \mid X_2},\ \sigma^2_{X_1 \mid X_2}\right)$$
>
> $$\mu_{X_1 \mid X_2} = \mu_1 + \rho\frac{\sigma_1}{\sigma_2}(x_2 - \mu_2)$$

To generalize to higher dimensions, the covariance between the variables needs to be considered too

$$
\begin{bmatrix} X_1 \\ X_2 \end{bmatrix} \sim \mathcal{N}\left( \begin{bmatrix} \mu_1 \\ \mu_2 \end{bmatrix}, \begin{bmatrix} \sigma_1^2 & \mathrm{Cov}(X_1,X_2) \\ \mathrm{Cov}(X_2,X_1) & \sigma_2^2 \end{bmatrix} \right)
$$

- $\mu_1, \mu_2$: Means of $X_1$ and $X_2$.
- $\sigma_1^2, \sigma_2^2$: Variances of $X_1$ and $X_2$.
- $\mathrm{Cov}(X_1,X_2) = \rho\sigma_1\sigma_2$: Covariance between $X_1$ and $X_2$.

> [!note] Assumption
> Note that GPs assume the function being modeled is smooth and continuous, which is encoded using a kernel function (e.g RBF)

##### RF / Bayesian NNs

Can be used for cases where GPs are not suitable (e.g very high dimensional spaces)

#### 3. Acquisition function

Determines the next value to be evaluated based on the surrogate model

1. **Expected Improvement (EI)** — this acquisition function picks points that maximise expected improvement over the current best value
2. **Probability of Improvement (PI)** — Picks points with the probability of improving over the current best.
   - How is it different from the above?
3. **Upper Confidence Bound (UCB)** — Balances mean and uncertainty

### Steps involved in BO

1. **Initialisation**: Start with a small set of random input points to evaluate the objective function
2. **Build surrogate model**: fit a probabilistic model to approximate $f(x)$
3. **Optimise the acquisition function**: use the surrogate model to determine where to evaluate next by optimizing the acquisition function
4. **Evaluate the model**: Compute the objective function
5. **Update the model**: add a new evaluation to the dataset
6. **Iterate**: Repeat steps 3 to 5 until convergence

### Limitations

- **Scalability**: good (only) for low dimensional spaces
- **Model assumptions**: performance depends on the choice of surrogate model
- **Computational overhead**: training the surrogate model can become expensive for large datasets
