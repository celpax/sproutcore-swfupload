// Set up the Name Space
SWFU={
	swfUploadVersion:"2.2.0.1"
};

/**
 * This is the base view used for upload, it is meant to be extended 
 * with your own UI.
 *  
 */
SWFU.UploadView=SC.View.design(SC.DelegateSupport,{
	
	// private reference to the uploader object
	_swfu:null,
	
	/**
	 * The url to upload the file to
	 */
	uploadUrl: null,
	
	/**
	 * Mandatory child view, there must be, at least, a button view to trigger the process
	 */
	childViews: "buttonView".w(),
	
	/**
	 * The button that will trigger the upload
	 */
	buttonView: SC.ButtonView.design({
		
	}),
	
	didAppendToDocument: function(){
		this._swfu = new SWFUpload({
			upload_url : this.get("uploadUrl"),
			flash_url : sc_static('swfupload.swf'),
			button_placeholder_id : this.getPath("buttonView.layer.id")
		});
	},
	
	willDestroyLayer: function(){
		
	},
	
});
