Make, Rake, Jake, Sake, Fake, Bake, Lake, Take, Kake, Wake

task('fixperms', function(options) {
  for each ( let f in Directory(options.path || options.p || '.').recursive() ) {
    f.chmod(f.isDirectory ? 0644 : 0755);
    f.chgrp('daniel');
    f.chown('daniel');
  }
});

task('test:unit', function() {
  ...
});

group('db', function() {
  var db;
  
  task('_init', function(options) {
    db = new DB(options.database || 'wiki');
  });
  
  // db:create
  task('create', '_init' function(options) {
    db.create();
    var t = db.table('users');
    t.create(formatFromFile);
  });
  
  // db:drop
  task('drop', '_init', function(options) {
    db.drop();
  });
  
});
