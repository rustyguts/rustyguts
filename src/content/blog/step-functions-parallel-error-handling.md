---
title: Step Functions parallel error handling
author: Rusty
pubDatetime: 2023-08-03T00:00:00Z
slug: step-function-parallel-error-handling
featured: false
draft: false
tags:
  - aws
  - step functions
description: How errors can crash parallel branches in Step Functions
---

I've been working with AWS Step Functions recently and one thing I've learned is that parallel tasks have unique failure behavior. If any step within a parallel branch errors, the entire parallel block is aborted.

![Image](/assets/img/5.svg)

For example, in this case, the "Long Action" step is not reached. The failure on the right causes the whole pipeline to fail, and at that point any ongoing steps are aborted. This may seem strict, but I assume AWS has their reasons for this approach.

## Solution 1: Handle Each Error

There are a couple of ways to handle errors in Step Functions. One common method is to add a Catcher for each step that might fail. By doing so, you instruct Step Functions to continue to the catch step when an error occurs.

![Image](/assets/img/2.svg)

Same as the diagram below, I just wanted to show how the flow looks different in the newer UI

![Image](/assets/img/1.svg)

> Step Functions doesn't allow you to reuse a catch. Each catch must be a descendant of the parent step, which can lead to extra clutter in your pipelines just to handle errors.

![Image](/assets/img/3.svg)

## Catch All Errors?

Another option is to use a catch handler for the entire parallel state block. Unfortunately, this still aborts other steps even if the error is handled.

![Image](/assets/img/4.svg)

## Summary

When working with a parallel state block, it's best to handle each error that occurs in a step. It might make your pipeline a bit messy, but it's crucial unless you want to halt all other steps when one of them fails.
