# Contributing

I use the latest version of node (`v20.11.0`) and npm (`10.4.0`), but older versions should work too. If `npm install` doesn't work, try upgrading to the latest node and npm.

## Prerequisites

### TypeScript

For this project, the most important skill is TypeScript programming.

Here are important things to learn about TypeScript:
* Basic types (objects, unions, enums, ...): https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
* Some Object Oriented Programming: https://www.typescriptlang.org/docs/handbook/2/classes.html
* “Narrowing”, an incredibly powerful feature: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

### Shader programming (optional)

A shader is code that runs on your GPU. They're used all the time in game development to code special effects. 

Here, shaders are mostly used for special move animations, like SURF or PSYCHIC. Any move that changes the colors of objects or animates the entire screen likely needs a shader.

The easiest way to play with shader programming is on https://www.shadertoy.com. I found [this tutorial](https://www.shadertoy.com/view/Md23DV), which seems to do a good job covering the basics.

### PIXI.js (optional)

PIXI.js is a graphics library for browser applications. All rendering happens via PIXI.js

This project has many functions and events that hide the PIXI.js calls, so unless you end up writing your own particle effects, you probably won't need to know much about PIXI.js.

If you are interested in learning, there are useful examples on their website: https://pixijs.com/playground. 

## Project layout

TODO: Describe major `.ts` files.

## Things to do

### Move animations and effects

Many moves have yet to be completed. This means animating and applying any other special effects.

[This file](MOVES.md) is a list of all moves that are finished.

TODO: Describe process for adding new moves.

### Folder organization

Right now all `.ts` files live in the same folder. These should be organized into nested folders.

### Held items

### Pack menu

### Stats menu

---

Thank you for checking this out! I appreciate the interest.

