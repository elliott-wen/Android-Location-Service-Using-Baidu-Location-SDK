package com.hellowind.sweethome;

import java.util.Date;
import java.util.List;

import com.hellowind.utils.ServiceUtils;

import android.app.ActivityManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;

public class UserStatusListener  extends BroadcastReceiver{
	private static long lastLocationUpdateTime=0;
	private ConnectivityManager connectMgr=null;
	@Override
	public void onReceive(Context arg0, Intent arg1) 
	{
		this.connectMgr=  (ConnectivityManager) arg0.getSystemService(Context.CONNECTIVITY_SERVICE);
		SharedPreferences preferences=arg0.getSharedPreferences(Config.SETTING, Context.MODE_PRIVATE);
		if(preferences.getBoolean(Config.OPENLOCATIONKEY, false))
		{
			startLocationService(arg0,arg1);
		}
	}
	 private boolean isNetworkAvailable()
	 {
		 
		 NetworkInfo mobNetInfo = connectMgr.getNetworkInfo(ConnectivityManager.TYPE_MOBILE);
		 NetworkInfo wifiNetInfo = connectMgr.getNetworkInfo(ConnectivityManager.TYPE_WIFI);
		 if (!mobNetInfo.isConnected() && !wifiNetInfo.isConnected()) 
		 {
			 return false;
		 } 
		 else 
		 {
			 return true;
		 }
	 }
	private void startLocationService(Context arg0, Intent arg1)
	{
		if(!isNetworkAvailable())
		{
			Log.v("SweetHome", "Location Service needs network");
			return;
		}
		Log.v("SweetHome", "Starting Location Service");
		if(new Date().getTime()-lastLocationUpdateTime>Config.LOCATIONDELAY)
		{
			if(!ServiceUtils.isServiceRunning(arg0,LocationService.class.getName()))
			{
				Intent locationService=new Intent(arg0, LocationService.class);
				arg0.startService(locationService);
				lastLocationUpdateTime=new Date().getTime();
			}
			else
			{
				Log.v("SweetHome", "Another Location Service is Running. Try shutting Down");
				Intent locationService=new Intent(arg0, LocationService.class);
				arg0.stopService(locationService);
			}
		}
		else
		{
			Log.v("SweetHome", "Location Service Run Too Much");
		}
	}
	
}
