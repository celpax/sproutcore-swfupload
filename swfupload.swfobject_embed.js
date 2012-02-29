/*
	SWFUpload.SWFObject_Embed Plugin

	Summary:
		This plugin uses SWFObject to embed the Flash Object using the swfobject.EmbedSWF method.
		The SWFUpload implementation uses innerHtml to modifiy the HTML code and insert the object element,
		 but it fails in IE9 and Cloudfront.
		IE9 do not send the HTTP GET request until 120 seconds 

	Features:
		* Widely used SWF Object embed mechanism.

	Usage:
		Just add this Javascript file in your project in the same folder as swfuplad.js.
		It has been tested for SWFUpload 2.2.0 2009-03-25
		
*/


delete SWFUpload.prototype.loadFlash;

SWFUpload.prototype.loadFlash = function () {
	var targetElement, tempParent;

	// Make sure an element with the ID we are going to use doesn't already exist
	if (document.getElementById(this.movieName) !== null) {
		throw "ID " + this.movieName + " is already in use. The Flash Object could not be added";
	}

	// Get the element where we will be placing the flash movie
	targetElement = document.getElementById(this.settings.button_placeholder_id) || this.settings.button_placeholder;

	if (targetElement == undefined) {
		throw "Could not find the placeholder element: " + this.settings.button_placeholder_id;
	}

	this.swfObjectEmbed();
	
	// Fix IE Flash/Form bug
	if (window[this.movieName] == undefined) {
		window[this.movieName] = this.getMovieElement();
	}
	
};

SWFUpload.prototype.swfObjectEmbed = function() {

	var flashvars = {
		'uploadURL': this.settings.upload_url,
		'useQueryString': this.settings.use_query_string,
		'requeueOnError': this.settings.requeue_on_error,
		'httpSuccess': this.settings.http_success.join(","),
		'assumeSuccessTimeout': this.settings.assume_success_timeout,
		'params': this.buildParamString(),
		'filePostName': this.settings.file_post_name,
		'fileTypes': this.settings.file_types,
		'fileTypesDescription': this.settings.file_types_description,
		'fileSizeLimit': this.settings.file_size_limit,
		'fileUploadLimit': this.settings.file_upload_limit,
		'fileQueueLimit': this.settings.file_queue_limit,
		'debugEnabled': this.settings.debug_enabled,
		'buttonImageURL': this.settings.button_image_url,
		'buttonWidth': this.settings.button_width,
		'buttonHeight': this.settings.button_height,
		'buttonText': this.settings.button_text,
		'buttonTextTopPadding': this.settings.button_text_top_padding,
		'buttonTextLeftPadding': this.settings.button_text_left_padding,
		'buttonTextStyle': this.settings.button_text_style,
		'buttonAction': this.settings.button_action,
		'buttonDisabled': this.settings.button_disabled,
		'buttonCursor': this.settings.button_cursor
	};
		    
	var params = {
	   'wmode': this.settings.button_window_mode,
	   'movie': this.settings.flash_url,
	   'quality': 'high',
	   'menu': false,
	   'allowscriptaccess': 'always',
	   'flashvars': this.getFlashVars()
	   };
		 
   var attributes = {
      'id':                     this.movieName,
      'class':				'swfupload'
   };

	swfobject.embedSWF(this.settings.flash_url, this.settings.button_placeholder_id, this.settings.button_width, this.settings.button_height, '9', 'false', flashvars, params, attributes);

};

