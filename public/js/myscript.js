console.log('myscript initialzed');

window.onload = function() {
  document.getElementById('filesToUpload').addEventListener('change', uploadMultipleFiles, true);
  renderImageGrid();
}

var storageRef = firebase.storage().ref();
var database = firebase.database();
var IMAGE_RENDER_LIMIT = 10;

//Render Image
function renderImageGrid(){
  try{
      var loadingImage = '<img src="images/loading.gif"/>';
      $("#displaySection").html(loadingImage);
      
      var selectedAlbum = $('#albumSelector').val();
      var keywordsRef = firebase.database().ref('images/' + selectedAlbum);
      keywordsRef.once('value').then(function(snapshot){

        console.log('keywordsRef Called');
        var obj = snapshot.val();
        var content = '';
        var i = 0;
        $.each(obj, function( key, value ){
          $responseObj = value;
          
          //Construct RAW HTML Object
          $.each($responseObj, function (akey, aValue){
            console.log(i + ' :' + akey + ':' + aValue);

            if(akey === 'downloadURLs'){
              content = content + '<div class="col-lg-3 col-md-4 col-xs-6 thumb">\
                      <a class="thumbnail" href="' + aValue + '">\
                          <img class="img-responsive" src="' + aValue + '" alt="">\
                      </a>\
                  </div>';
            }
          });

          i++;
          if(i > IMAGE_RENDER_LIMIT){
                return false;
          }
        });

        $("#displaySection").html(content);
      });
  }catch(err){
    console.log(err.message);
  }
}

function handleFileSelect(evt) {
	console.log('File Selected');
	evt.stopPropagation();
	evt.preventDefault();
	var file = evt.target.files[0];

	uploadFile(file);
}

function writeImagePath(name, downloadURLs) {
	var postData = {
	    name: name,
	    downloadURLs: downloadURLs
  	};

  var selectedAlbum = $('#albumSelector').val();
  console.log('Selected Album: ' + selectedAlbum);
  //var newPostKey = firebase.database().ref().child('images/' + selectedAlbum + '/').push().key;
  var key = name.replace('.','_').replace('(','').replace(')','');
  var updates = {};
  updates['images/' + selectedAlbum + '/' + key] = postData;

  firebase.database().ref().update(updates);
}

function uploadMultipleFiles(evt){
	console.log('Multiple Files Selected');
	evt.stopPropagation();
  evt.preventDefault();
	input = evt.target.files;
	
	for (var x = 0; x < input.length; x++) {
		var file = input[x];
		uploadFile(file);
	}
}

function uploadFile(file){
	console.log('Filename: ' + file.name);

  var metadata = {
    'contentType': file.type
  };

  // Push to child path.
  // [START oncomplete]
  var selectedAlbum = $('#albumSelector').val();
  storageRef.child('images/'+ selectedAlbum + '/' + file.name).put(file, metadata).then(function(snapshot) {
    console.log('Uploaded', snapshot.totalBytes, 'bytes.');
    console.log(snapshot.metadata);
    var url = snapshot.metadata.downloadURLs[0];
    console.log('File available at', url);

    // 	WRITE IMAGE METADATA TO DATABASE
    writeImagePath(file.name, url);
  }).catch(function(error) {
    // [START onfailure]
    console.error('Upload failed:', error);
    // [END onfailure]
  });
  // [END oncomplete]
}