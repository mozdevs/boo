# Boo

MediaRecorder API demo.

[Access it online](http://mozdevs.github.io/boo/), or keep reading for how to get the sources and run it locally.

## Requirements

### Hardware requirements

* A working webcam (otherwise, what's the point of a VideoBooth?)
* Speakers or audio output (if you want to listen to spooky sounds too)

### Software requirements

* Firefox xx. This is a Firefox technical demo. So it *might* not work on your browser, if it doesn't implement what we're demoing.
* Support for `canvas.getStream` (this lets us get a video stream out of a canvas tag)
* Support for `MediaRecorder` (this lets us generate a video file in the browser)
* ... <!-- TODO what else? Any about:config setting? -->

## How to get and run it

You need node.js installed in order to build the project (node.js provides the `npm` utility). Once you have node.js and git installed, you can go to a terminal and type in the following:

```bash
git clone https://github.com/mozdevs/boo.git
cd boo
npm install
npm start
```

The project will be built to the `dist/` folder. Open `dist/index.html` in your browser to run the project.

### Getting rid of the *do you want to share the camera?* dialog

If you serve the site using https, the browser will show you an additional option to store your camera and microphone sharing preferences. This can be really useful during development, to avoid having to give permission to use the webcam each time you reload the page.

Serving content using https is not obvious, but here's [a nice tutorial](https://certsimple.com/blog/localhost-ssl-fix) explaining how to do this on Mac OS. If you know how to do the same for Linux or Windows, please let us know!

Once you have a working https server, have it serve files from the `dist/` file and access its address on your browser, instead of opening `dist/index.html` directly. E.g. if you followed the instructions from the tutorial, your server will be running in port 8080, so go to [https://localhost:8080](https://localhost:8080/) to access the booth. You will be asked if you want to share the camera and microphone the first time you access it, and if you select "Always share" instead of "Share selected devices", your preferences will be saved and the dialog won't pop up again when you reload, unless you click the little camera icon on the left side of the URL bar and select "Stop sharing" from the drop down.

<!-- TODO: probably add screenshots -->

## Developing

(TODO: describe where the important files are)

If you make changes to the code and want to see the result of the changes, run the `build` script:

```bash
npm run build
```

It will regenerate the contents of the `dist/` folder, and you can either open or reload `dist/index.html` in your browser.

<!--
TODO: dist is using sh. We shouldn't make assumptions about people's environments. Developers using Windows can't run this unless they install Cygwin, etc.

To compile a distribution version, just run `dist`, which in turn will run `build`:

```
npm run dist
```
-->

But that is a bit tedious, and you might forget to run `build` after each change, so we also provide the `watch` script. You can run it and leave it `watch`ing for changes, and it will automatically run `build` for you each time there's a change in the source code:

```
npm run watch
```

## Deploying

*Deploying* for this project means taking the contents of `dist/` and putting them anywhere accessible to the internet.

### Pushing to your server

Once you have `dist`, you can copy the contents to your web server space using any SFTP client or rsync or anything that you like. There are no specific server-side requirements as this is all front-end code. Yay HTML5!

### Pushing to GitHub

If you want to push a copy to GitHub, so you don't host this in your server:

change to branch `gh-pages`, run `dist`, commit your changes, and then run `deploy`.

```
git checkout gh-pages
npm run dist
git add dist
git commit
npm run deploy
```

What `npm run deploy` is exactly a subtree push:

```
git subtree push --prefix dist origin gh-pages
```

**In case of conflicts**, run a subtree pull, solve the conflicts and then commit again.

```
git subtree pull --prefix dist origin gh-pages
```

Work to simplify this section is tracked on [issue #8](https://github.com/mozdevs/boo/issues/8).

## Prototypes, demos and other stuff

We're building intermediate prototypes to figure out how to do certain semi-isolated things, and putting them in the `other/` folder.
