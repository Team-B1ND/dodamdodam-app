package com.b1nd.dodam.student.watch.shared

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService

private const val TIMETABLE_PATH = "/dodam/timetable"
private const val MEALS_PATH = "/dodam/meals"
private const val VALUE_KEY = "value"

class WatchDataListenerService : WearableListenerService() {

  override fun onCreate() {
    super.onCreate()
    WatchDataRepository.init(applicationContext)
  }

  override fun onDataChanged(dataEvents: DataEventBuffer) {
    for (event in dataEvents) {
      if (event.type != DataEvent.TYPE_CHANGED) continue
      val dataMap = DataMapItem.fromDataItem(event.dataItem).dataMap
      val json = dataMap.getString(VALUE_KEY) ?: continue
      when (event.dataItem.uri.path) {
        TIMETABLE_PATH -> WatchDataRepository.applyTimetable(json)
        MEALS_PATH -> WatchDataRepository.applyMeals(json)
      }
    }
  }
}
