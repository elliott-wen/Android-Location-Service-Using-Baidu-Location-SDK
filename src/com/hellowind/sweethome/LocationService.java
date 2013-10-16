package com.hellowind.sweethome;




import java.net.URI;
import java.util.HashMap;
import java.util.Map;



import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.IBinder;
import android.util.Log;

public class LocationService extends Service{
	public LocationClient mLocationClient = null;
	SharedPreferences preferences=null;
	
	public BDLocationListener myListener = new MyLocationListener();
	@Override
	public IBinder onBind(Intent arg0) {
		// TODO Auto-generated method stub
		return null;
	}
	
	 @Override
	    public void onCreate() 
	 {
	        super.onCreate();
	        
	        mLocationClient = new LocationClient(getApplicationContext());     //声明LocationClient类
	        mLocationClient.registerLocationListener( myListener );    //注册监听函数
	        preferences=getSharedPreferences(Config.SETTING, Context.MODE_PRIVATE);
	        Log.v("Location Service","Location Service Ready to Work");
	        startLocationJob();
	       
	 }
	 public void startLocationJob()
	 {
		 	Log.v("Location Service","Try location");
			 		if(mLocationClient!=null&&!mLocationClient.isStarted())
			 		{
				 			mLocationClient.start();
				 			int error=mLocationClient.requestLocation();
				 			Log.v("Location Service","Location Request Send:Code "+error);
			 		}
			 	
			 	
		 	
		 	
	 }
	private void showTips()
	{
		/*Notification notification = new Notification(R.drawable.list_location, "Locaton has updated!", System.currentTimeMillis());
		notification.flags |= Notification.FLAG_AUTO_CANCEL;  
		Intent contentIntent = new Intent(this, LocationActivity.class);
		PendingIntent contentPendingIntent = PendingIntent.getActivity(this, 0, contentIntent, PendingIntent.FLAG_UPDATE_CURRENT);
		notification.setLatestEventInfo(this, "Location has updated", "Click to see detail", contentPendingIntent);
		((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE)).notify(3265, notification);*/
	}
	
	 public class MyLocationListener implements BDLocationListener {
			@Override
			public void onReceiveLocation(BDLocation location) 
			{
				mLocationClient.stop();
				Log.v("Location Service","Shutdown Location Services");
				LocationService.this.stopSelf();
				if (location == null||(location.getLocType()<=167&&location.getLocType()>=162))
				{
					Log.v("Location Service","Location Services Return null");
					return ;
				}
				String detailAddress="Unknown";
				if(location.getAddrStr()!=null)
				{
					detailAddress=location.getAddrStr();
				}
				Editor editor=preferences.edit();
				editor.putFloat(Config.LASTLONGKEY, (float)location.getLongitude());
				editor.putFloat(Config.LASTLATKEY,(float)location.getLatitude());
				editor.putString(Config.LASTADDRESSKEY, detailAddress);
				editor.commit();
				/*try
				{
					   URI uri = URI.create(Config.APIURL);
					   XMLRPCClient client = new XMLRPCClient(uri);
					   Map<String, Object> structx = new HashMap<String, Object>();
					   String page=String.format("[gmap time=\"%s\" lat=\"%f\" long=\"%f\" accuracy=\"%f\" geoinfo=\"%s\"]",location.getTime(),location.getLatitude(),location.getLongitude(),location.getRadius(),detailAddress);
					   structx.put("post_content", page);
					   Object[]  params = new Object[] { Config.BLOGID, Config.USERNAME, Config.PASSWORD, Config.MAPPAGEID,structx};
					   client.callEx("wp.editPost", params);
					   Log.v("Location Service","Location Service Update Remote Map Success");
					   if(preferences.getBoolean(Config.OPENLOCATIONTIPSKEY, false))
					   {
						   showTips();
					    }
				} 
				catch(Exception e)
				{
					e.printStackTrace();
					Log.v("Location Service","Location Service Update Remote Map Failed");
				}*/
				
				
				StringBuffer sb = new StringBuffer(256);
				sb.append("time : ");
				sb.append(location.getTime());
				sb.append("\nerror code : ");
				sb.append(location.getLocType());
				sb.append("\nlatitude : ");
				sb.append(location.getLatitude());
				sb.append("\nlontitude : ");
				sb.append(location.getLongitude());
				sb.append("\nradius : ");
				sb.append(location.getRadius());
				if (location.getLocType() == BDLocation.TypeGpsLocation){
					sb.append("\nspeed : ");
					sb.append(location.getSpeed());
					sb.append("\nsatellite : ");
					sb.append(location.getSatelliteNumber());
				} else if (location.getLocType() == BDLocation.TypeNetWorkLocation){
					sb.append("\naddr : ");
					sb.append(location.getAddrStr());
				} 
				Log.v("Location Service",sb.toString());
				
				
			}
		public void onReceivePoi(BDLocation poiLocation) 
		{
					
		}
	}
}
