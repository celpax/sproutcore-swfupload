// Set up the Name Space
SWFU={
	swfUploadVersion:"2.2.0.1"
};

/**
 * This is the base view used for upload, it is meant to be extended 
 * with your own UI. This implementation supports only a sigle file
 * upload.
 *  
 */
SWFU.UploadView=SC.View.extend(SC.DelegateSupport,{
	
	// The delegate object for this view. 
	_delegate:null,
	
	// private reference to the uploader object
	_swfu:null,
	_swfuploadLoaded: NO,
		
	/**
	 * Mandatory child view, there must be, at least, a button view to trigger the process
	 */
	childViews: "buttonView".w(),
	
	/**
	 * The button that will trigger the upload
	 */
	buttonView: SC.ButtonView.design({
		title: "Upload"
	}),
	
	didAppendToDocument: function(){
      	this.invokeLast(this.setupSWFUpload); 
	},
	
	/**
	 * Creates the SWFUpload.
	 */
	setupSWFUpload: function(){	
		var del=this.get('delegateObject'), obj=this;
		
		this._swfu = new SWFUpload({
			debug: true,
			upload_url: obj.invokeDelegateMethod(del,"uploadUrl",obj),
			button_action:SWFUpload.BUTTON_ACTION.SELECT_FILE,
			button_cursor:SWFUpload.CURSOR.HAND,
			button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,
			
			flash_url : sc_static('swfupload.swf'),
			button_placeholder_id : this.getPath("buttonView.layer.id"),
			swfupload_loaded_handler: function(){obj.swfuploadLoaded()},
			file_dialog_start_handler: function(){obj.invokeDelegateMethod(del,"fileDialogStart",obj)},
			file_queued_handler: function(file){obj.invokeDelegateMethod(del,"fileQueued",obj,file)},
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
	 * The swfUploadLoaded event is fired by flashReady. It is settable. 
	 * swfUploadLoaded is called to let you know that it is safe to call SWFUpload methods.
	 */
	swfuploadLoaded: function(){
		if(this._uploadUrl) this._swfu.setUploadURL(this._uploadUrl);
	},
	
	willDestroyLayer: function(){
		this._swfu.destroy();
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