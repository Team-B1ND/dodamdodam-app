//
//  MealWidgetView.swift
//  dodamwidgetExtension
//
//  Created by 김은찬 on 3/26/26.
//

import SwiftUI
import WidgetKit
import AppIntents

struct MealWidgetView: View {
  var entry: MealEntry
  @Environment(\.widgetFamily) var widgetFamily
  
  var selectedType: MealType {
    if #available(iOS 17.0, *) {
      let saved = UserDefaults(suiteName: "group.com.b1nd.dodam.student.shared")?
        .string(forKey: "selectedMealType") ?? ""
      return MealType(rawValue: saved) ?? MealType.from(Date())
    }
    return MealType.from(Date())
  }
  
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
    if widgetFamily == .systemMedium {
      mediumContent
    } else {
      smallContent
    }
  }
  
  @ViewBuilder
  var mediumContent: some View {
    let currentMeal = entry.meals.first { $0.mealType == selectedType.rawValue }
    
    VStack(spacing: 8) {
      HStack(spacing: 6) {
        if #available(iOS 17.0, *) {
          ForEach(MealType.allCases, id: \.self) { type in
            let meal = entry.meals.first { $0.mealType == type.rawValue }
            let isSelected = selectedType == type
            
            Button(intent: SelectMealIntent(mealType: type.rawValue)) {
              HStack(spacing: 4) {
                Text(type.label)
                  .font(.footnote.bold())
                  .foregroundColor(isSelected ? .white : WidgetColor.labelAlternative)
                Spacer()
                if let meal {
                  Text("\(Int(meal.calorie))Kcal")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(isSelected ? .white.opacity(0.8) : WidgetColor.labelAlternative)
                    .lineLimit(1)
                    .layoutPriority(1)
                }
              }
              .padding(.horizontal, 10)
              .padding(.vertical, 6)
              .background(isSelected ? WidgetColor.primaryNormal : WidgetColor.backgroundNormal)
              .clipShape(Capsule())
            }
            .buttonStyle(.plain)
          }
        } else {
          Text(selectedType.label)
            .foregroundColor(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(WidgetColor.primaryNormal)
            .clipShape(Capsule())
            .font(.footnote.bold())
          Spacer()
          if let meal = currentMeal {
            Text("\(Int(meal.calorie))Kcal")
              .font(.caption)
              .foregroundColor(WidgetColor.labelAlternative)
          }
        }
      }
      
      VStack(alignment: .leading, spacing: 2) {
        if let meal = currentMeal {
          if meal.menus.isEmpty {
            MealMenuText(text: "오늘은 급식이 없어요", isMealEmpty: true)
          } else {
            let half = Int(ceil(Double(meal.menus.count) / 2.0))
            let left = Array(meal.menus.prefix(half))
            let right = Array(meal.menus.dropFirst(half))
            
            HStack(alignment: .top, spacing: 8) {
              VStack(alignment: .leading, spacing: 6) {
                ForEach(left, id: \.self) { menu in
                  MealMenuText(text: menu)
                }
              }
              .frame(maxWidth: .infinity, alignment: .leading)
              
              if !right.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                  ForEach(right, id: \.self) { menu in
                    MealMenuText(text: menu)
                  }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
              }
            }
          }
        } else {
          MealMenuText(text: "급식 정보가 없어요", isMealEmpty: true)
        }
        Spacer(minLength: 0)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      .padding(10)
      .background(WidgetColor.backgroundNormal)
      .clipShape(RoundedRectangle(cornerRadius: 14))
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(12)
  }
  
  @ViewBuilder
  var smallContent: some View {
    let currentType = MealType.from(Date())
    let currentMeal = entry.meals.first { $0.mealType == currentType.rawValue }
    
    VStack(spacing: 8) {
      if let meal = currentMeal {
        HStack {
          Text(currentType.label)
            .foregroundColor(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(WidgetColor.primaryNormal)
            .clipShape(Capsule())
            .font(.footnote.bold())
          Spacer()
          Text("\(Int(meal.calorie))Kcal")
            .font(.caption)
            .foregroundColor(WidgetColor.labelAlternative)
        }
        
        VStack(alignment: .leading, spacing: 2) {
          if meal.menus.isEmpty {
            MealMenuText(text: "오늘은 급식이 없어요", isMealEmpty: true)
          } else {
            let displayCount = min(meal.menus.count, 6)
            ForEach(0..<displayCount, id: \.self) { idx in
              let menuName = (idx == 5 && meal.menus.count > 6) ? "..." : meal.menus[idx]
              MealMenuText(text: menuName)
            }
          }
          Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(WidgetColor.backgroundNormal)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        
      } else {
        Text("급식 정보가 없습니다")
          .font(.footnote)
          .foregroundStyle(WidgetColor.labelAlternative)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(12)
  }
}
