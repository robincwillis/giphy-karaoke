
var karaoke = {
	showTime : false,
	currentTime : 0,
	currentLineIndex : 0,
	currentSequence : "",
	currentInterval : null,
	clock : 0,
	playing : false,
	progress : 0,
	lastPercentage : 0,
	gifsLoaded : 0,
	totalGifs : 0,
	audio : document.getElementById('audio'),

	// ========================
	// Updates
	// ========================
	render : function(){
		//console.log('rendering...');

		this.currentLine = this.lyrics[this.currentLineIndex];
		this.currentTime = this.audio.currentTime

		var $el = $(this.nodes.children()[this.currentLineIndex]);
		var $nextEl = $(this.nodes.children()[this.currentLineIndex+1]);


		if(this.showTime){
			console.log(this.currentTime);
			//console.log(this.clock);
		}

		if(this.currentLine.state === 'focus'){
			this.advanceProgress($el, this.currentLine, this.currentTime);
		}

		if( this.currentLine.start <= this.currentTime && this.currentLine.state === 'waiting' ){
			this.lastPercentage = 0;
			this.progress = 0;
			this.currentLine.state = 'focus';

			if(this.currentLine.sequence && this.currentLine.sequence !== this.currentSequence){
				this.currentSequence = this.currentLine.sequence;
				this.renderSequence(this.currentSequence);
			}

			$el.removeClass('pop-next').addClass('pop-focus');
			$nextEl.removeClass('pop-waiting').addClass('pop-next');
		}

		if(this.currentLine.end <= this.currentTime && this.currentLine.state === 'focus'){
			this.currentLine.state = 'out';
			this.currentLineIndex ++;
			$el.removeClass('pop-focus').addClass('pop-out');

		}


	},

	renderGif : function(sequence){
		//if image is loaded and src !== undefined
		// if not recal
			var images = $('.'+ sequence).children();
			images.removeClass('on').addClass('off');
			var selector = Math.floor((Math.random() * images.length-1) + 1);

			var gif = $(images[selector])
			if(gif.attr('src') !== "undefined" && gif.width()){
				gif.removeClass('off').addClass('on');
			} else {
				this.renderGif(sequence);
			}

	},

	renderSequence : function(sequence){

		var rotateInterval = 4500;

		if(sequence === 'buildup'){
			rotateInterval = 100;
		}


		$('.sequence').removeClass('on').addClass('off');
		$('.' + sequence  ).removeClass('off').addClass('on');

		var self = this;

		if(this.currentInterval){
			clearInterval(this.currentInterval);
		}

		this.currentInterval = setInterval(function(){

			self.renderGif(sequence);

			//var on = true;
			//var colors = ["red", "blue", "black", "gold", "lime", "white", "deeppink", "azure"];

			//var index = Math.floor(Math.random()*colors.length);
			///$('.building').css({background : on ? "black" : colors[index] });
			//document.body.style.backgroundColor =  on ? "black" : colors[index];
			//on = !on;


		}, rotateInterval);

		//pop some more gifs in this sequence
		var sequenceObj = _.findWhere(this.sequences,{key:sequence});
		this.buildSequence(sequenceObj, 1);

	},

	advanceProgress : function($el, currentLine, currentTime){

		var duration = currentLine.end - currentLine.start;
		var position = currentTime - currentLine.start;
		var percentage = (position/duration) * 100;

		var progress = this.progress;
		var lastPercentage = this.lastPercentage;

		if(currentLine && currentLine.steps  && percentage < 100){
			_.each(currentLine.steps, function(step, i){

				var nextAt = currentLine.steps[i+1] ? currentLine.steps[i+1].at : 100;
				var nextPos =  currentLine.steps[i+1] ? currentLine.steps[i+1].pos : 100;

				if(percentage > step.at && percentage < nextAt){
					var speed = ( (nextPos - step.pos) / (nextAt - step.at));
					progress += (percentage - lastPercentage) * speed
					$el.find('.text-mask').css('width', progress + "%");
				}
			});

		} else {
			$el.find('.text-mask').css('width', percentage + "%");
		}

		this.lastPercentage = percentage;
		this.progress = progress;
	},

	// ========================
	// Methods
	// ========================

	addGifToSequence : function(sequence, gif){
		if(gif !== undefined){
			karaoke.totalGifs ++;
			var image = new Image();
			image.src = gif;
			var html =  '<img class="on" src="'+gif+'" />';
			$('.'+sequence).append(html);
			$(html).on('load', function(){
				karaoke.gifsLoaded ++;
				$('.imagesLoaded').text('loaded ' + karaoke.gifsLoaded + ' out of ' + karaoke.totalGifs + ' gifs');
			})
		}
	},

	buildSequence : function(sequence, gifsPerSequence){
		console.log('build Sequence Called');
		if(sequence !== undefined){
			var querySample = _.sample(sequence.query, 1);
			console.log(querySample);
			var query = querySample.join('+')
			//each sequence, do a query on giphy and then add Gifs to dom
			var url = 'http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&rating=r&tag='+query;

			for(var i = 0; i < gifsPerSequence; i++){
				this.getGifs(url, sequence.key, this.addGifToSequence);
			}
		}
	},
	buildSequences : function(){
		_.each(this.sequences, function(sequence){
			this.buildSequence(sequence, 4);
		}, this);

	},
	buildNode : function(lyric){

		var node =	'';
		node +=			'<div class="line pop-waiting">';
		node +=					'<div class="text-container">';
		node +=						'<div class="text text-back">';
		node +=							'<div class="center-text">';
		node +=								lyric.text;
		node +=							'</div>';
		node +=						'</div>';
		node +=					'<div class="text text-front">';
		node +=						'<div class="center-text">';
		node +=							'<div class="text-mask">';
		node +=								lyric.text;
		node +=							'</div>';
		node +=						'</div>';
		node +=					'</div>';
		node +=				'</div>';
		node +=			'</div>';

		return node;
	},
	buildNodes : function(lyrics){

		var nodes = [];

		_.each(lyrics, function(lyric){
			var node = karaoke.buildNode(lyric);
			nodes.push(node);
		});

		var html = $('.text-layer').html(nodes.join(" "));
		return html;
	},
	buildTitle : function(song){
		var title = "";
		title += 		'<h1 class="title">'+song.title+'</h1>';
		title +=		'<h4 class="artist">'+song.artist+'</h4>';
		title +=		'<h4 class="date">Releaseed '+song.date+'</h4>';
		var html = $('.title-layer').append(title);
		return html;
	},
	// ========================
	// Events
	// ========================
	bindEvents : function(){

		var self = this;

		$('.play').on('click',function(e){

			$('.title-layer').addClass('hidden');

			setTimeout(function(){
				self.nodes.children().first().removeClass('pop-waiting').addClass('pop-next');
				self.renderSequence('verse');
				self.playing = true;
				self.audio.play();

					// The whole state of the app depends on the audio time of the song.
					// You can skip to any part and the app will pickup at the right place
					//audio.currentTime = 290 //seek track forward

				},2000);
		});

		$('.pause').on('click',function(e){
			self.playing = false;
			self.audio.pause();
			console.log(self.playing);
		});

	},
	// ========================
	// Services
	// ========================
	getGifs : function(url, sequence, callback){

		$.ajax({
			url: url,

		})
		.done(function(data) {
			if(typeof(data.data) === 'object'){
				var gif = data.data.image_url
				callback(sequence, gif);
			}
		})
		.fail(function() {
			console.log("error fetching gifs from giphy");
		})
		.always(function() {
		});
	},

	init :function(lyrics, song, sequences){
		this.lyrics = lyrics;
		this.song = song;
		this.sequences = sequences;
		this.buildSequences(sequences);
		this.title = this.buildTitle(song);
		this.nodes = this.buildNodes(lyrics);
		this.bindEvents();
	}
}

var sequences = [
	{ key : "verse",
		query : ["80s", "hair", "tears", "drama", "sad"]
	},
	{ key : "chorus",
		query : ["dance", "joy", "beauty", "retro"]
	},
	{ key : "breakdown",
		query : ["kawaii", "anime", "eclipse", "yes"]
	},
	{ key : "buildup",
		query : ["laser", "glitch", "insane", "vhs", "damage"]
	},
	{ key : "bridge",
		query : ["timelapse", "death", "breakdown", "lightning"]
	},
	{ key : "release",
		query : ["nature", "timelapse", "ice", "glitter", "flower"]
	}

 ];

var song = {
	title : "Total Eclipse Of The Heart",
	artist : "Bonnie Tyler",
	date : "1983"
}

karaoke.init(lyrics, song, sequences);

//If we want access to all the methods in the browser console.
//window.karaoke = karaoke;

// ========================
// Request Animation Frame
// ========================
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();

(function animloop(){
	requestAnimFrame(animloop);
	if(karaoke.playing){
		karaoke.clock += 1 / 60;
		karaoke.render();
	}
})();

