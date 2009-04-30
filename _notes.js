
function File( path ) {
	if( !arguments.constructing ) return new File( path );
	if( typeof path == 'string' ) path = new FilePath( path );
	if(!( path instanceof FilePath )) throw new TypeError('Invalid path given to File constructor');
	
	this.__defineGetter__( 'path', function() path );
	this.__defineGetter__( '_handle', function() null );
	
}

File.prototype.open = function(mode, flags) {
	if( this.isOpen ) throw new IOError('File is already open');
	var handle = _native.pr_open( this.path.toString(), ... );
	this.__defineGetter__( '_handle', function() handle );
	if( !handle ) throw IOError('Could not open file');
	return this;
}
File.prototype.__defineGetter__( 'isOpen', function() !!this._handle /*&& _native.fopened( this._handle )*/ );

File.prototype.close = function() {
	if(	!this.isOpen ) throw new IOError('File is not open');
	var status = _native.pr_close( this._handle )
	if( status != _native.PR_SUCCESS ) {
		var err = _native.pr_error();
		if( err != _native.PR_WOULD_BLOCK_ERROR )
			throw new IOError();
	}
	this.__defineGetter__( '_handle', function() null );
	return true;
}

File.prototype.stat = function() {
	return _native.fstat( this.path.toString() );
	/* {
		path: canonical string file path,
		atime: last accessed time,
		mtime: last modified time,
		ctime: last changed time,
		access: permissions,
		user: user,
		group: group,
		inode: 
		devide: 
		
	} */
}

File.prototype.same = function( other ) {
	if( typeof file == 'string' ) other = new File( other );
	var a = this.stat();
	var b = other.stat();
	return a && b && a.inode == b.inode;
}

