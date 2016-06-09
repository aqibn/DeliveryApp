# nativescript-orientation
A NativeScript plugin to deal with Declarative UI and Screen Orientation

## License

This is released under the MIT License, meaning you are free to include this in any type of program -- However for entities that need a support contract, changes, enhancements and/or a commercial license please contact me (nathan@master-technology.com).

## Sample Snapshot
![Sample1](docs/orientation1.gif)
Thanks to TJ VanToll for the awesome animated gif.
 

## Installation 

tns plugin add nativescript-orientation  


## Usage

To use the module you just `require()` it:

```js
require( "nativescript-orientation" );
```

Notice: You do NOT need to keep a reference to it; and you only need to load it once.   I recommend you add it to your app.js file and forget about it.

It will automatically attach its methods to all the proper classes in the NativeScript library making it act as if they are built in.

What this does is automatically add and remove the "landscape" to the current **Page**'s cssClass variable (and does other magic behind the scenes allowing it to actually work).  

## You ask, how exactly does this help?
Well, guess what Cascading means in CSS?  
Yes, this means this works now: 

```css
StackLayout {
  background-color: red;
}

.landscape StackLayout {
  background-color: green;
}
```

So in portrait the background would be red, in landscape the color is green.

## Why use this?
You can set ALL the normal CSS values this way include width, height, font-size.
By using the css to control any normal items and your own page's exports.orientation to control anything not controllable by css you can change the look completely between Landscape/Portrait.


### You can add to any page you need it the following Function:
#### exports.orientation(args) 
##### args.landscape = true | false
##### args.page = the current page
This function (if exists) will be ran when the page is first opened so you can set any needed defaults. (This is ran at the same time as the PageNavigatedTo event)
This function (if exists) will be ran each time the orientation changes.
Unfortunately at this moment some items can't be controlled by CSS like orientation on ScrollView, so this allows you to control change those things when the orientation changes.


### Additional Helper Method

#### application.getOrientation()
```js
  var application = require('application');
  console.log(application.getOrientation());  // Returns the enum DeviceOrientation value
```




