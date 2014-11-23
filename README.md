js-sortable-table
=================

The script creates a table with the columns: title, description, duration, uploaded and displays videos information loaded from a youtube json file. The first 4th columns are sortable and the last one contains a button which when pressed scroll down to the end of table and display the 'thumbnail-hq' image of the video.

# Usage

Load the script in the html file, at the end of body:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title></title>
    <link rel="stylesheet" href="css/index.css">
</head>
<body>
    <img src="" alt="Youtube videos" id="thumbnail-hq"/>
    <script src="js/jquery-1.11.1.min.js"></script>
    <script src="js/script.js"></script>
</body>
</html>
```

