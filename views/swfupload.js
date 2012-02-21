// Set up the Name Space
SWFU={
	swfUploadVersion:SWFUpload.version
};

/**
 * This is the UploadButton View. Wich includes the Button UI (an SC.View) and a placeholder for the flash.
 * The overlay method is used to place it. All views have the same dimensions, the flash is transparent and
 * its over the button.
 * 
 * So far, uploading one file only "use case" is supported. Should be easy to extend to support uploading multiple files.
 *  
 */
SWFU.UploadView=SC.View.extend(SC.DelegateSupport,{
	
	classNames: "sc-swfupload".w(),
	
	// The delegate object for this view. 
	_delegate:null,
	
	// private reference to the uploader object
	_swfu:null,
		
	/**
	 * Will load the SWFupload debug messages.
	 */
	debug: NO,
	
	/**
	 * The title to put on the button
	 */
	title: "upload",
	
	
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
	childViews: "buttonView swuploadView".w(),
	
	/**
	 * The Button UI, must have the same dimensions as this VIEW.
	 * The button will be (visually) enabled only after the flash has been loaded.
	 * In some cases (CDN distribution) flash download takes some additional time creating
	 * a significant usability issue.
	 * 
	 */
	
	buttonView: SC.ButtonView.design({
		title:"upload",
		isEnabled: NO
	}),

	/**
	 * The Flash Placeholder, must have the same dimensions as this view.
	 * Will be positioned on top of the butto. by using the overlay method
	 * descrived in the SWUpload documentation. CSS zindex must be used to ensure
	 * this view is over the button. 
	 */
	swuploadView: SC.View,
	
	
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
		if(!document.getElementById(this.getPath("swuploadView.layer.id"))) return;

		if(this.get("debug")) SC.Logger.debug("Creating SWFUpload Component");
		
		this._swfu = new SWFUpload({
			debug: this.get("debug"),
			upload_url: this.workoutUploadUrl(del),
			file_post_name: this.get("filePostName"),
			button_action:SWFUpload.BUTTON_ACTION.SELECT_FILE,
			button_cursor:SWFUpload.CURSOR.HAND,
			button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
			button_width: this.getPath('frame.width'),
			button_height: this.getPath('frame.height'),
			flash_url : sc_static('swfupload.swf'),
			prevent_swf_caching : false,
			button_placeholder_id : this.getPath('swuploadView.layerId'),
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
		if(this.get("debug")) SC.Logger.debug("Destroying SWFUpload Component");
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
		this.setPath("buttonView.isEnabled",YES);
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
