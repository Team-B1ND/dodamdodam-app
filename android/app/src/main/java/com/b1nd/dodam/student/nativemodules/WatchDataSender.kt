package com.b1nd.dodam.student.nativemodules

import android.content.Context
import android.util.Log
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable

// 워치는 자체 로그인 없이, 이미 인증된 아이폰(안드로이드) 앱이 가져온 데이터만 전달받는다.
object WatchDataSender {
  private const val VALUE_KEY = "value"

  fun send(context: Context, path: String, json: String) {
    val request = PutDataMapRequest.create(path).apply {
      dataMap.putString(VALUE_KEY, json)
      dataMap.putLong("timestamp", System.currentTimeMillis())
    }.asPutDataRequest().setUrgent()
    Wearable.getDataClient(context.applicationContext).putDataItem(request)
      .addOnSuccessListener { Log.d("WatchDataSender", "putDataItem OK path=$path") }
      .addOnFailureListener { Log.e("WatchDataSender", "putDataItem FAILED path=$path", it) }
  }
}
