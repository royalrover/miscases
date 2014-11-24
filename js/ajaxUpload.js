/**
 * Created by admin on 2014/10/13.
 * upload.js
 * html5
 */
var Upload = {
    inputFile: null,
    dragArea: null,
    subBtn: null,
    filter : function(files){
        return files;
    },
    filterFiles: [],
    saveURL: '',
    onSelect: function(){},
    onDelete: function(){},
    onSuccess: function(){},
    onComplete: function(){},
    onError: function(){},
    onDragover: function(){},
    onDragleave: function(){},
    onDrop: function(){},
    onProgress: function(){},
    dragHandler: function(e){
        e.type === 'dragover' ? this.onDragover.call(e.target) : this.onDragleave.call(e.target);
        e.stopPropagation();
        e.preventDefault();
        return this;
    },
    getUploadFiles: function(e){
        var files, i,len,file;
        if(e.type.toLowerCase().indexOf('drag') !== -1){
            this.dragHandler(e);
        }
        files = e.target.files || e.dataTransfer.files;
        this.filterFiles = this.filterFiles.concat(this.filter(files));
        for(i=0,len=this.filterFiles.length;i<len;i++){
            file = this.filterFiles[i];
            file.index = i;
        }
        this.onSelect(this.filterFiles);
        return this;
    },
    delUploadFiles: function(file){
        var i,len,f,nfiles = [];
        for(i=0,len=this.filterFiles.length;i<len;i++){
            f = this.filterFiles[i];
            if(f === file){
                this.onDelete(file);
            }else{
                nfiles.push(f);
            }
        }
        this.filterFiles = nfiles;
    },
    uploadFiles: function(e){
        var i,len,file,self = this;
        if (location.host.indexOf("sitepointstatic") >= 0) {
            //非站点服务器上运行
            return;
        }
        for(i=0,len=this.filterFiles.length;i<len;i++){
            file = this.filterFiles[i];
            (function(file,i){
                var xhr = new XMLHttpRequest();
                if(xhr.upload){
                    xhr.upload.addEventListener('progress',function(e){self.onProgress(file,e.loaded, e.total)},false);
                    xhr.onreadystatechange = function(){
                        if(xhr.readyState === 4){
                            if(xhr.status === 200){
                                self.onSuccess(file);
                                self.delUploadFiles(file);
                                if(!self.filterFiles.length){
                                    self.onComplete();
                                }
                            }else{
                                self.onError(file);
                            }
                        }
                    };
                    xhr.open('POST',self.saveURL,true);
                    xhr.setRequestHeader('X-FILENAME',file.name);
                    xhr.send(file);
                }
            })(file,i);
        }
    },
    initialize: function(params){
        var self = this;
        this.inputFile = params.inputFile;
        this.dragArea = params.dragArea;
        this.subBtn = params.subBtn;
        this.filter = params.filter;
        this.saveURL = params.saveURL;
        this.onSelect = params.onSelect;
        this.onDelete = params.onDelete;
        this.onSuccess = params.onSuccess;
        this.onComplete = params.onComplete;
        this.onError = params.onError;
        this.onDragover = params.onDragover;
        this.onDragleave = params.onDragleave;
        this.onDrop = params.onDrop;
        this.onProgress = params.onProgress;
        //鼠标点击选取文件
        this.inputFile.addEventListener('change',function(e){self.getUploadFiles(e)},false);
        //拖拽文件
        this.dragArea.addEventListener('dragover',function(e){self.dragHandler(e)},false);
        this.dragArea.addEventListener('dragleave',function(e){self.dragHandler(e)},false);
        this.dragArea.addEventListener('drop',function(e){self.getUploadFiles(e)},false);
        //上传文件
        this.subBtn.addEventListener('click',function(e){self.uploadFiles(e)},false);
    }
}
