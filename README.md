[Hosting](#hosting)|
[Embedding](#embedding)
#Mapify

 [![build status](https://travis-ci.org/simopaasisalo/mapify.svg?branch=master)](http://travis-ci.org/simopaasisalo/mapify)

![alt text](https://github.com/simopaasisalo/mapify/blob/master/misc/map_preview.png "Map previews")



Mapify is a map making tool that takes in data in multiple formats and outputs a powerfully visualized map. 

It is built on Leaflet and OpenStreetMaps by React/TypeScript using MobX for state control. 

Currently it is only a simple client application, but a server application and some social features and being planned.


License: MIT

Hosting
=======
```
1. git clone
2. npm install
3. open index.html
```

Embedding
=========

1. Create a .mapify file from your data
  1. Upload to Mapify
  2. Make visualizations
  2. Save as a file 
2. Host your file someplace where it can be accessed remotely
3. Use an IFrame to embed into your page:
  1. src - pointing to the `index.html` on a hosted Mapify instance
  2. mapURL - URL of the .mapify-file
```
<iframe style="height: 400px; width: 400px;"
src="http://simopaasisalo.github.io/mapify/index.html
?
mapURL=http://simopaasisalo.github.io/mapify/demos/symboldemo.mapify"</iframe>
```

Author
-----
Simo Paasisalo [Mail](mailto:simopaa@student.uef.fi)|[LinkedIn](https://fi.linkedin.com/in/simopaasisalo)
