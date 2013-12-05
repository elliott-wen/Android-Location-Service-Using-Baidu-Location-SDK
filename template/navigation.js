navigation_template={'html':'\
<ul><li><a href="#">Blog</a></li>\
<% _.each(menus, function(menu) { %> <li><a href="<%=menu.link%>"><%= menu.text %></li></a> <% }); %>\
</ul>\
'};