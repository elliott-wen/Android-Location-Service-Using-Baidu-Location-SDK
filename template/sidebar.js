var sidebar_template={};
sidebar_template.recentPost={'html':'\
<div class="sidebar_recent_post"> \
<h1>Recent Post</h1>\
<ul><% _.each(recentPosts, function(post) { %> <li><a href="#/posts/<%= post.id %>"><%= post.title %></li></a> <% }); %> </ul>\
</div> \
'};
sidebar_template.twitter={'html':'\
<div class="sidebar_twitter"></div> \
'};