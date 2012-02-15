// Set up the Name Space
SWFU={
	swfUploadVersion:"2.2.0.1"
};

/**
 * This is the UploadButton View. You can include it with onther UI elements in your windows.
 * The delegate can point to a controller and other UI elements, such as a progress bar can read
 * their values from that controller.
 * 
 * So far, uploading one file only "use case" is supported. Should be easy to extend to support uploading multiple files.
 *  
 */
SWFU.UploadView=SC.View.extend(SC.DelegateSupport,{
	
	// The delegate object for this view. 
	_delegate:null,
	
	// private reference to the uploader object
	_swfu:null,
	_swfuploadLoaded: NO,
	
	/**
	 * Will load the SWFupload debug messages.
	 */
	debug: YES,
	
	/**
	 * If your session is authenticated, you might experience Flash not allways sending
	 * the session cookie. Specify this parameter and ";cookie=value" will be added to the
	 * URL.
	 */
	sessionCookieName: null,
	
	/**
	 * The file post name. 
	 */
	filePostName: "Filedata",
		
	/**
	 * Mandatory child view, there must be, at least, a button view to trigger the process
	 */
	childViews: "buttonView".w(),
	
	/**
	 * The Placeholder for the button.
	 */
	buttonView: SC.View,
	
	// FLash 10 restrictions. See SWUpload docs
	didCreateLayer: function(){
      	this.invokeLast(this.setupSWFUpload); 
	},
	
	updateLayer: function(){
		sc_super();
	},
	
	didAppendToDocument: function(){
      	this.invokeLast(this.setupSWFUpload); 
	},
	
	/**
	 * Creates the SWFUpload.
	 */
	setupSWFUpload: function(){	
		var del=this.get('delegateObject'), obj=this;
		
		// some workarrounds related to shoing the flash ONLY when it is visible
		if(this._swfu) return; 
		if(!document.getElementById(this.getPath("buttonView.layer.id"))) return;

		SC.Logger.debug("Creating SWFUpload Component");
		
		this._swfu = new SWFUpload({
			debug: this.get("debug"),
			upload_url: this.workoutUploadUrl(del),
			file_post_name: this.get("filePostName"),
			button_action:SWFUpload.BUTTON_ACTION.SELECT_FILE,
			button_cursor:SWFUpload.CURSOR.HAND,
			button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,
			button_image_url: "http://demo.swfupload.org/v220/simpledemo/images/TestImageNoText_65x29.png", //TODO: fix
			button_text: "upload",
			button_width: 65,
			button_height: 29,
			flash_url : sc_static('swfupload.swf'),
			button_placeholder_id : this.getPath('buttonView.layerId'),
			swfupload_loaded_handler: function(){obj.swfuploadLoaded(del)},
			file_dialog_start_handler: function(){obj.invokeDelegateMethod(del,"fileDialogStart",obj)},
			file_queued_handler: function(file){obj.invokeDelegateMethod(del,"fileQueued",obj,file);obj._swfu.startUpload();},
			file_queue_error_handler: function(file,error,message){obj.invokeDelegateMethod(del,"fileQueueError",obj,file,error,message)},
			file_dialog_complete_handler: function(nFileSelected, nFilesQueued, totalFilesQueued){obj.invokeDelegateMethod(del,"fileDialogComplete",obj,nFileSelected, nFilesQueued, totalFilesQueued)},
			upload_start_handler: function(file){return obj.invokeDelegateMethod(del,"uploadStart",obj,file);},
			upload_progress_handler: function(file,completedBytes,totalBytes){obj.invokeDelegateMethod(del,"uploadProgress",obj,file,completedBytes,totalBytes)},
			upload_error_handler: function(file,errorCode,message){obj.invokeDelegateMethod(del,"uploadError",obj,file,errorCode,message)},
			upload_success_handler: function(file,serverData,response){obj.invokeDelegateMethod(del,"uploadSuccess",obj,file,serverData,response)},
			upload_complete_handler: function(file){obj.invokeDelegateMethod(del,"uploadComplete",obj,file)},
			debug_handler: function(message){obj.debug(message)}
		});
		
	},
	
	/**
	 * Gets the upload URL, add the session ID if required.
	 */
	workoutUploadUrl:function(del){
		var url=this.invokeDelegateMethod(del,"uploadUrl",this), cookie=this.get("sessionCookieName");
		if(cookie){
			url=url+";"+cookie+"="+SC.Cookie.find(cookie).get('value');
		}
		return url;
	},
	
	destroySWFUpload: function(){
		SC.Logger.debug("Destroying SWFUpload Component");
		if(this._swfu) this._swfu.destroy();
		this._swfu=null;
	},
	
	/**
	 * The swfUploadLoaded event is fired by flashReady. It is settable. 
	 * swfUploadLoaded is called to let you know that it is safe to call SWFUpload methods.
	 */
	swfuploadLoaded: function(del){

		// IE9 patch, 
		// CoreQuery will fail to dispatch events, will try to get SC attributes on DOM Elements
		// Created by SWFUpload
		// we make it return its ID for whatever SC attribute it is aked...
		this._swfu.movieElement.getAttribute=function(){return this.id;};
		
		// get the upload URL from delegate		
		this.invokeDelegateMethod(del,"swfuploadLoaded",this);
	},
	
	willDestroyLayer: function(){
		this.destroySWFUpload();
	},
	
	/**
	 * Property that returns the delegate object if it has been assigned, or this.
	 */
	delegateObject: function(){
		return this.get('delegate')? this.get('delegate'): this;
	}.property('delegate').cacheable(),
	
	/**
	 * Logs debug information
	 */
	debug: function(message){
		SC.Logger.debug(message);
	}
	
	
});
