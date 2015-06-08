# Giphy Karaoke

####Sing Karaoke while watching gifs pulled straight from Giphy

Really scrappy WIP for now. Hope to continue refactoring to be more easily customizable (ie, load all the settings from a config etc).


##[Demo](http://robincwillis.github.io/giphy-karaoke/)

##How It Works

###Lyrics

The app reads objects from the `lyrics.js` file. The structure of each object is

```json
	{
		text : "Every now and then I get a little bit tired",
		start : 17,
		end : 20,
		state : 'waiting',
		sequence : 'verse',
	}
```

where `text` is the text to show, `start` is the time in seconds that the text should come into focus, and `end` is the time in seconds that the text should move out of focus. `state` should always be set to `"waiting"` for now. `sequence` is optionally set to a key which defines which gif sequence should be loaded for the current text. As the app progresses through each lyric object it will check to see if the value for sequence changes and show the corresponding gif sequence.

Optionally if you would like to adjust the timing of progress within the text item, ie speed it up or slow it down to match the vocalists timing you can specify an array called `steps` like this.

```json
{
	text : "Every now and then I get a little bit lonely",
	//...
	steps : [
						{
							at : 0,
							pos : 0
						},
						{
							at :  50,
							pos : 20
						},
						{
							at : 	65,
							pos : 85
						},
						{
							at : 100,
							pos : 100
						}
				]
}
```

where the `at` property is a percentage of progress, and the `pos` property is a percentage of the visual progress that should be shown for `at`. So in the example above, when `at` is at 50% (halfway through the text). The actual visual progress should only be at 20%. The steps array should always begin with `at` and `pos` at 0,0 and end at 100,100.


###Visuals

The app queries the random endpoint of Giphy's [API](https://api.giphy.com/) and loads a number of random gifs per sequence at startup. As the sequences progress it continues to add more gifs. To set the sequence queries, look for the `sequences` array at the bottom of the app. It looks like this


```json
var sequences = [
	{ key : "verse",
		query : ["80s", "hair", "tears", "drama", "sad"]
	},
	{ key : "chorus",
		query : ["dance", "joy", "beauty", "retro"]
	},
	{ key : "bridge",
		query : ["timelapse", "death", "breakdown", "lightning"]
	}
];
```
Each `key` property in `sequences` should correspond to a class in the DOM like this.

```html
		<div class="sequence off verse"></div>
		<div class="sequence off chorus"></div>
		<div class="sequence off bridge"></div>
```

###Todo

1. Better folder structure
2. Progress bar for loading gifs
3. Make it easier to set gif queries
4. prefix css for cross browser compatibility


