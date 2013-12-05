(function(global){
	var ARTICLE_DATA="data/article";
	var ARTICLE_DIR="data/";
	var SETTING_DATA="data/settings";
	var CONTAINER_TAG="Container";
	var HEADER_CONTAINER_TAG="#HeaderContainer";
	var FOOTER_CONTAINER_TAG="#FooterContainer";
	var SIDEBAR_CONTAINER_TAG="#SidebarContainer";
	var ARTICLE_CONTAINER_TAG="#ArticleContainer";
	var NAVIGATION_CONTAINER_TAG="#NavigationContainer";
	var ARTICLE_DEFAULT_PER_PAGE=5;
	var ARTICLE_CACHE_SIZE=20;
	var ARTICLE_MAX_ITEM_IN_MEMORY=100;
	var ARTICLE_EXCERPT_SIZE=120;
	//Model Definition
	var ArticleEntryCollection=Backbone.Collection.extend({
		model:ArticleEntryModel,
		url:ARTICLE_DIR
	});
	var SettingsModel=Backbone.Model.extend({
		url:SETTING_DATA
	});
	var ArticleIndexModel=Backbone.Model.extend({
		url:ARTICLE_DATA
	});
	var ArticleEntryModel=Backbone.Model.extend({
	});
	//View Definition
	var ArticleView=Backbone.View.extend({
		showArticleList:function(ids)
		{
				var htmlArticle="";
				this.$el.html("");//Empty;
				
				_.each(ids,function(id)
				{
					var model=articleEntryCollection.get(id);
					if(!model) 
					{
						return true;
					}
					else
					{
						
						var originalText=model.get("content");
						var excerpt=$(originalText).text().substring(0,ARTICLE_EXCERPT_SIZE);
						model.set("excerpt",excerpt);
						htmlArticle+=_.template( article_template.listItem.html, model.attributes );
					}
				});
				if(_.find(index,function(val){return val<ids[ids.length-1];}))
				{
					htmlArticle+=_.template( article_template.next.html,{page:parseInt(currentPageId)+1});
				}
				if(_.find(index,function(val){return val>ids[0];}))
				{
					htmlArticle+=_.template( article_template.prev.html,{page:parseInt(currentPageId)-1});
				}
				this.$el.append(htmlArticle);
		},
		showSingleArticle:function(ids)
		{
				var htmlArticle="";
				this.$el.html("");//Empty;
				_.each(ids,function(id)
				{
					var model=articleEntryCollection.get(id);
					if(!model) 
					{
						alert("Failed to ready article");
					}
					else
					{
						
						htmlArticle+=_.template( article_template.single.html, model.attributes );
					}
				});
				this.$el.html(htmlArticle);
				this.showComment();
		},
		showComment:function()
		{
			var disqus_shortname = "githubpager";
			disqus_identifier = settings.get("domain")+'/'+currentSinglePageId
		    disqus_url = settings.get("domain")+'/'+currentSinglePageId;
			var disqus_script = 'embed.js';
			var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
			dsq.src = "http://"+disqus_shortname + '.disqus.com/' + disqus_script;
			console.log(dsq.src);
			(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
			
		}
		
		
	});
	var HeaderView=Backbone.View.extend({
		render: function(model){
           var template = _.template( header_template.html, model.attributes );
		   this.$el.html(template);
        }
	});
	var FooterView=Backbone.View.extend({
		render: function(model){
           var template = _.template( footer_template.html, model.attributes );
		   this.$el.html(template);
        }
	});
	var NavigationView=Backbone.View.extend({
		render: function(model){
           var template = _.template( navigation_template.html, model.attributes );
		   this.$el.html(template);
        }
	});
	var SidebarView=Backbone.View.extend({
		
		showRecentPost: function(ids){
			if(currentPageId!=1) return;
			this.$el.html("");
			var attr={};
			attr.recentPosts=[];
			_.each(ids,function(id)
			{
				var model=articleEntryCollection.get(id);
				if(!model) 
				{
						
				}
				else
				{
					var post={};
					post.title=model.get("title");
					post.id=model.get("id");
					attr.recentPosts.push(post);
				}
			});
			var template = _.template( sidebar_template.recentPost.html, attr );
			this.$el.prepend(template);
			this.showSocialLink();
        },
		showSocialLink:function()
		{
		}
	
	});
	//Router Definition
	var AppRouter = Backbone.Router.extend
	({
        routes: {
            "posts/:id": "getPost",
			"page/:pid":"getPage",
            "*actions": "defaultRoute" 
        },
        getPost: function( id ) {
			loadAndShowSingleArticle(id);
        },
		getPage:function(pid)
		{
			loadAndShowArticleList(pid);
		},
        defaultRoute: function( actions )
		{
           loadAndShowArticleList();
        }
    });
	
	//Some variables
	var settings=new SettingsModel();
	var articleIndex=new ArticleIndexModel();
	var articleEntryCollection=new ArticleEntryCollection();
	articleEntryCollection.comparator='id';
	var headerView=null;
	var	footerView=null;
	var	sidebarView=null;
	var articleView=null;
	var navigationView=null;
	var index=null;
	//Single Post Page
	var currentSinglePageId=-1;
	//Paging System
	var currentPageId=1;
	var article_per_page=ARTICLE_DEFAULT_PER_PAGE;

	//Router
	var app_router = new AppRouter;
	
	
	
	
	function loadEntryData(ids)
	{
		if(articleEntryCollection.length>ARTICLE_MAX_ITEM_IN_MEMORY)
		{
			articleEntryCollection.reset();
		}
		var i=0;
		var needToLoad=0;
		var hasLoad=0;
		_.each(ids,function(id)
		{
			if(!articleEntryCollection.get(id))
			{
				needToLoad++;
				var model=new ArticleEntryModel();
				model.id=id;
				articleEntryCollection.add(model,{silent: true});
				model.fetch
				({
					success:function(rmodel)
					{
						hasLoad++;
						if(hasLoad==needToLoad) 
							articleEntryCollection.trigger("dataAvailable",ids);
					},
					error:function(rmodel){
						hasLoad++;
						articleEntryCollection.remove(rmodel,{silent: true});
						if(hasLoad==needToLoad) 
						{	
							articleEntryCollection.trigger("dataAvailable",ids);
						}
					}
				});
			}
		});
		if(needToLoad==0) articleEntryCollection.trigger("dataAvailable",ids);
	}
	
	
	
	function loadAndShowArticleList(pageId)
	{
		if(pageId) currentPageId=pageId;
		articleView.listenToOnce(articleEntryCollection,"dataAvailable",articleView.showArticleList);
		sidebarView.listenToOnce(articleEntryCollection,"dataAvailable",sidebarView.showRecentPost);
		var ids=[];
		var i=(currentPageId-1)*article_per_page;
		while(i<currentPageId*article_per_page)
		{
			if(i>index.length-1) break;
			ids.push(index[i]);
			i++;
		}
		
		loadEntryData(ids);
	}
	
	function loadAndShowSingleArticle(id)
	{
		articleView.listenToOnce(articleEntryCollection,"dataAvailable",articleView.showSingleArticle);
		currentSinglePageId=id;
		var ids=[];
		ids.push(id);
		loadEntryData(ids);
	}
	
	function set_article_per_page(model)
	{
		article_per_page=model.get("article_per_page");
	}
	
	
	
	function setupIndex(model)
	{
		index=model.get("ids").sort(function(a,b){return b-a;});
	}
	
	var GitHubPager={
		init:function(config)
		{
			//Init Var
			headerView=new HeaderView({ el: $(HEADER_CONTAINER_TAG) });
			footerView=new FooterView({ el: $(FOOTER_CONTAINER_TAG) });
			sidebarView=new SidebarView({ el: $(SIDEBAR_CONTAINER_TAG) });
			articleView=new ArticleView({el:$(ARTICLE_CONTAINER_TAG)});
			navigationView=new NavigationView({el:$(NAVIGATION_CONTAINER_TAG)});
			//Bind Event
			headerView.listenToOnce(settings,"change",headerView.render);
			footerView.listenToOnce(settings,"change",footerView.render);
			sidebarView.listenToOnce(settings,"change",sidebarView.render);
			navigationView.listenToOnce(settings,"change",navigationView.render);
			articleView.listenToOnce(settings,"change",set_article_per_page);
			articleView.listenToOnce(articleIndex,"change",setupIndex);
			
			//Preload Settings And Index
			settings.fetch({
				success:function()
				{
					articleIndex.fetch({
						success:function()
						{ 
							Backbone.history.start();
						},
						error:function(){alert("Loading index failed");}
					});
				},
				error:function(){alert("Loading settings failed");}
			});
			
			
		}
	};
	
	
	
    // Start Router
    
	global.GitHubPager=GitHubPager;	
})(this);

