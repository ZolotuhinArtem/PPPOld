;( function () {
	'use strict';
	var tracks = [];

	var mainPageId = "mainPage";
	var trackPageId = "trackPage";
	var contentMainId = "content_main";
	var contentTrackId = "content_track";
	var trackListId = "track_list";
	var currentPage = mainPageId;
	
	
    window.addEventListener( 'tizenhwkey', function( ev ) {
        if( ev.keyName === "back" ) {
            var activePopup = document.querySelector( '.ui-popup-active' ),
                page = document.getElementsByClassName( 'ui-page-active' )[0],
                pageid = page ? page.id : "";

            if( pageid === mainPageId && !activePopup ) {
                try {
                	if (confirm("Exit?")) {
                		tizen.application.getCurrentApplication().exit();
                	}
                } catch (ignore) {
                }
            } else {
                window.history.back();
            }
        }
    } );
    
    $(document).ready(function(e) {
        configureApp();
    });
    
    function configureApp() {
    	var pageMain = document.getElementById(mainPageId);
    	var pageTrack = document.getElementById(trackPageId);
    	var contentMain = document.getElementById(contentMainId);
    	var contentTrack = document.getElementById(contentTrackId);
    	bindSwipe(pageMain, contentMain, function (direction) {
    		if (direction == "left") {
    			goToPage(mainPageId, trackPageId);
    		}
    	});
    	bindSwipe(pageTrack, contentTrack, function (direction) {
    		if (direction == "right") {
    			if (currentPage = trackPageId){
    				currentPage = mainPageId;
    				window.history.back();
    			}
    		}
    	});
    	
   		$("#btn_sort_by_title").bind("click", function(e) {
   			tracks.sort(trackUtils.compareTrackByTitle);
   			var list = document.getElementById(trackListId);
   			Ui.showTracks(list, tracks);
   		});
   		$("#btn_sort_by_artist").bind("click", function(e) {
   			tracks.sort(trackUtils.compareTrackByArtist);
   			var list = document.getElementById(trackListId);
   			Ui.showTracks(list, tracks);
   		});
   		$("#btn_sort_by_album").bind("click", function(e) {
   			tracks.sort(trackUtils.compareTrackByAlbum);
   			var list = document.getElementById(trackListId);
   			Ui.showTracks(list, tracks);
   		});
   		
		Model.searchTracks(onSearchTracks);
		
		function onSearchTracks(trackArray){
			if (trackArray.length > 0) {
				for(var i = 0; i < trackArray.length; i++) {
					tracks.push(trackArray[i]);
				}
				var list;
				list = document.getElementById(trackListId);
				
				tracks.sort(trackUtils.compareTrackByTitle);
				
				Ui.showTracks(list, tracks);
			} else {
				console.log("No in tracks");
			}
		}
    		
    }
    
    

    
    function onClickTrack(index){
    	console.log("Index = " + index + "Track uri = " + tracks[index].contentURI);
    	Ui.updateTrackPage(tracks[index]);
    	goToPage(mainPageId, trackPageId);
    }



    function bindSwipe(page, contentOfPage, onSwipe){
    	/*
    	 * page is element, which has data-role="page"
    	 * contentOfPage usually is element, which has data-role="content"
    	 * it is call onSwipe(direction)
    	 * direction: "left", "right"
    	 */
    	page.addEventListener("pagebeforeshow", function() {
    		tau.event.enableGesture(contentOfPage, new tau.event.gesture.Swipe({
    			orientation: "horizontal"
    		}));
    		
    		contentOfPage.addEventListener("swipe", function(e) {
    			console.log("swipe direction = " + e.detail.direction);
    			onSwipe(e.detail.direction);
    		});
    	});
    }

    function goToPage(from, to) {
    	if (currentPage = from) {
    		currentPage = to;
    		tau.changePage("#" + to);
    	}
    }

    function getNextTrack(currentTrack) {
    	for (var i = 0; i < tracks.length; i++){
    		if(tracks[i].contentURI == currentTrack.contentURI) {
    			if (i < tracks.length - 1) {
    				return tracks[i + 1];
    			}
    		}
    		return tracks[0];
    	}
    }
    var trackUtils = {
    	compareTrackByTitle: function (a, b) {
    		if (a.title > b.title) {
    			return 1;
    		} else {
    			if (a.title < b.title) {
    				return -1;
    			} else {
    				return 0;
    			}
    		}
    	},

    	compareTrackByAlbum: function (a, b) {
    		if (a.album > b.album) {
    			return 1;
    		} else {
    			if (a.album < b.album) {
    				return -1;
    			} else {
    				return 0;
    			}
    		}
    	},
    	compareTrackByArtist: function (a, b) {
    		if (a.artists[0] > b.artists[0]) {
    			return 1;
    		} else {
    			if (a.artists[0] < b.artists[0]) {
    				return -1;
    			} else {
    				return 0;
    			}
    		}
    	}
    };    
    
    
    var Ui = {
		showTracks: function (list, trackArray){
	    	if (trackArray.length > 0) {
	    		console.log("showTracks: Cleaning list...");
	    		//list.empty();
	    		var list = this.deleteChilds(list);
	    		console.log("showTracks: Ok!");
	    		var li;
	    		for(var i = 0; i < trackArray.length; i++) {
	    			li = document.createElement('li');
	    			li.innerText = this.getFormatedTrackName(trackArray[i]);
	    			li.setAttribute('class', 'ui-li-static');
	    			li.addEventListener('click', onClickTrack.bind(null, i), false);
	    			list.appendChild(li);
	    			var listInst = tau.widget.getInstance(list);
	    			listInst.refresh();
	    			console.log("showTracks: appended in listview " + this.getFormatedTrackName(trackArray[i])); 
	    		}
//	    		list.listview("refresh");
	    	} else {
	    		alert("Tracks not found on your device");
	    	}
	    	
	    },
	    updateTrackPage: function (track) {
	    	console.log("update track called")
	    	$("#audio").attr('src', track.contentURI);
	    	$("#audio").bind("ended", this.updateTrackPage.bind(this, getNextTrack(track)));
	    	$("#track_attributes_list_view").listview("refresh");
	    	$("#track_title").text(track.title);
	    	$("#track_album").text(track.album);
	    	$("#track_artist").text(track.artists[0]);
	    },
	    deleteChilds : function (elem) {
	    	while (elem.firstChild) {
	    		elem.removeChild(elem.firstChild);
	    	}
	    	return elem;
	    }, 
	    getFormatedTrackName: function (track){
	    	return track.artists[0] + " - " + track.title + " - " + track.album;
	    }
	    
    };
    
    var Model = {
		/*
		 * @param {function} onSearchTracks
		 */
		searchTracks: function (onSearchTracks){
			
	    	tizen.content.getDirectories(function (folders){
	        	var filter = new tizen.AttributeFilter ("type", "EXACTLY", "AUDIO");
	        	for (var i = 0; i < folders.length; i++) {
	        		try{
	    	    		tizen.content.find(onSearchTracks, function(e){console.log("e")}, folders[i].id, filter, new tizen.SortMode('title', 'ASC'));
	        		} catch (exc) {
	        			console.warn('tizen.content.find exception: ' + exc.message);
	        		}
	        	}
	        	console.log(str);
	        }, function (err){console.log("getTracks: error")});
	    	
	    }
    }
    
} () );







