//
//  TimetableWidgetView.swift
//  dodamwidgetExtension
//
//  Created by 김은찬 on 3/27/26.
//

import SwiftUI
import WidgetKit

struct TimetableWidgetView: View {
  var entry: TimetableEntry
  @Environment(\.widgetFamily) var widgetFamily
  @Environment(\.widgetRenderingMode) var widgetRenderingMode

  private var isFullColor: Bool { widgetRenderingMode == .fullColor }

  private let days = ["월", "화", "수", "목", "금"]
  
  private var isWeekday: Bool {
    let weekday = Calendar.current.component(.weekday, from: Date())
    return weekday >= 2 && weekday <= 6
  }
  
  private var todayLabel: String {
    let weekday = Calendar.current.component(.weekday, from: Date())
    let idx = weekday - 2
    guard idx >= 0, idx < days.count else { return "주말" }
    return "\(days[idx])요일"
  }
  
  // MARK: - Body
  var body: some View {
    Group {
      if #available(iOSApplicationExtension 17.0, *) {
        content
          .containerBackground(WidgetColor.backgroundNeutral, for: .widget)
      } else {
        content
      }
    }
  }
  
  @ViewBuilder
  var content: some View {
    switch widgetFamily {
    case .systemSmall:
      smallContent
    case .systemMedium:
      mediumContent
    case .systemLarge:
      largeContent
    default:
      smallContent
    }
  }
  
  // MARK: - Small
  @ViewBuilder
  var smallContent: some View {
    VStack(spacing: 8) {
      HStack {
        TimetableHeaderLabel(label: todayLabel)
        Spacer()
      }
      
      VStack(alignment: .center, spacing: 0) {
        if !isWeekday {
          TimetableEmptyText(text: "주말에는\n시간표가 없어요")
        } else if entry.todaySubjects.isEmpty {
          TimetableEmptyText(text: "등록된\n시간표가 없어요")
        } else {
          let visibleSubjects = Array(entry.todaySubjects.prefix(7).enumerated())
          VStack(alignment: .leading, spacing: 0) {
            ForEach(visibleSubjects, id: \.offset) { idx, subject in
              TimetablePeriodRow(
                period: idx + 1,
                subject: subject,
                fontSize: 10,
                periodWidth: 26,
                isHighlighted: idx == entry.currentPeriod
              )
              .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
          }
        }
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .padding(10)
      .background(isFullColor ? WidgetColor.backgroundNormal : Color.clear)
      .clipShape(RoundedRectangle(cornerRadius: 14))
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(12)
  }
  
  // MARK: - Medium
  @ViewBuilder
  var mediumContent: some View {
    VStack(spacing: 8) {
      HStack {
        TimetableHeaderLabel(label: todayLabel)
        Spacer()
      }
      
      VStack(alignment: .center, spacing: 0) {
        if !isWeekday {
          TimetableEmptyText(text: "즐거운 주말 보내세요! \n주말에는 시간표가 없어요.")
        } else if entry.todaySubjects.isEmpty {
          TimetableEmptyText(text: "오늘 등록된 시간표가 없습니다.")
        } else {
          let subjects = entry.todaySubjects
          let half = Int(ceil(Double(subjects.count) / 2.0))
          let left = Array(subjects.prefix(half))
          let right = Array(subjects.dropFirst(half))
          
          HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
              ForEach(Array(left.enumerated()), id: \.offset) { idx, subject in
                let isCurrent = idx == entry.currentPeriod
                TimetablePeriodRow(
                  period: idx + 1,
                  subject: subject,
                  fontSize: 12,
                  periodWidth: 32,
                  isHighlighted: isCurrent
                )
              }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 2) {
              ForEach(Array(right.enumerated()), id: \.offset) { idx, subject in
                let currentIdx = half + idx
                let isCurrent = currentIdx == entry.currentPeriod
                TimetablePeriodRow(
                  period: currentIdx + 1,
                  subject: subject,
                  fontSize: 12,
                  periodWidth: 32,
                  isHighlighted: isCurrent
                )
              }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
          }
        }
        Spacer(minLength: 0)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .padding(12)
      .background(isFullColor ? WidgetColor.backgroundNormal : Color.clear)
      .clipShape(RoundedRectangle(cornerRadius: 14))
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(12)
  }
  
  // MARK: - Large
  @ViewBuilder
  var largeContent: some View {
    VStack(spacing: 8) {
      if entry.weekTimetable.isEmpty {
        TimetableEmptyText()
      } else {
        HStack(spacing: 4) {
          Color.clear.frame(width: 35, height: 1)
          ForEach(Array(days.enumerated()), id: \.offset) { idx, day in
            let isTodayHighlight = isWeekday && (idx == entry.weekday)
            
            Text(day)
              .font(.footnote.bold())
              .foregroundColor(isFullColor && isTodayHighlight ? .white : WidgetColor.labelAlternative)
              .frame(maxWidth: .infinity)
              .padding(.vertical, 6)
              .background(
                isFullColor
                  ? (isTodayHighlight ? WidgetColor.primaryNormal : WidgetColor.backgroundNormal)
                  : Color.clear
              )
              .clipShape(Capsule())
              .widgetAccentable(isTodayHighlight)
          }
        }
        
        let maxPeriod = 7
        
        VStack(spacing: 4) {
          ForEach(0..<maxPeriod, id: \.self) { period in
            HStack(spacing: 4) {
              let isCurrentRow = isWeekday && (period == entry.currentPeriod)
              
              Text("\(period + 1)교시")
                .font(.caption2.bold())
                .foregroundStyle(isCurrentRow ? WidgetColor.primaryNormal : WidgetColor.labelAlternative)
                .frame(width: 35)
              
              ForEach(0..<5, id: \.self) { dayIdx in
                let isCurrentCell = isWeekday && (dayIdx == entry.weekday && period == entry.currentPeriod)
                let isTodayColumn = isWeekday && (dayIdx == entry.weekday)
                
                let subject = (dayIdx < entry.weekTimetable.count && period < entry.weekTimetable[dayIdx].count)
                ? entry.weekTimetable[dayIdx][period] : "-"
                
                Text(subject)
                  .font(.caption2)
                  .fontWeight(isCurrentCell ? .bold : .regular)
                  .foregroundStyle(
                    isFullColor
                      ? (isCurrentCell ? .white : (isTodayColumn ? WidgetColor.primaryNormal : WidgetColor.labelNormal))
                      : (isTodayColumn ? WidgetColor.labelNormal : WidgetColor.labelAlternative)
                  )
                  .lineLimit(1)
                  .minimumScaleFactor(0.7)
                  .frame(maxWidth: .infinity, maxHeight: .infinity)
                  .padding(.vertical, 4)
                  .background(
                    isFullColor
                      ? (isCurrentCell ? WidgetColor.primaryNormal : (isTodayColumn ? WidgetColor.primaryNormal.opacity(0.1) : WidgetColor.backgroundNormal))
                      : Color.clear
                  )
                  .clipShape(RoundedRectangle(cornerRadius: 6))
                  .widgetAccentable(isCurrentCell)
              }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
          }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(12)
  }
}
