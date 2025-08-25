# Interactive Coaching Platform - Spec Summary

> **Project**: Skill Forge Evolution  
> **Created**: 2025-08-22  
> **Status**: Planning Phase

## 🎯 **Core Transformation**

**From**: Single-page roadmap with overwhelming content  
**To**: Multi-page guided walkthrough with focused milestone experiences  
**Result**: Personal coach-like experience that eliminates cognitive overload

## 🏗️ **New Architecture**

### **Page Structure**

```
Main Dashboard (My Forge)
├── Skill Overview Page (per skill)
│   ├── Visual Skill Tree
│   ├── Current Milestone Card
│   └── Progress Summary
└── Milestone Pages (per milestone)
    ├── Focused Learning Content
    ├── "Do This Now" Action Block
    └── Progress Logging
```

### **Navigation System**

- **Global Navigation**: Persistent "Dashboard" button
- **Breadcrumb Trail**: Dashboard > Skill Name > Milestone Name
- **Skill Cards**: Easy switching between multiple skills
- **Progress Tracking**: Clear indication of current position

## 📱 **User Flow**

### **New User Journey**

1. **Landing**: Main Dashboard (My Forge)
2. **Discover**: Browse Skill Library
3. **Select**: Choose skill to learn
4. **Generate**: Enter prompt, get skill deconstruction
5. **Overview**: See skill tree and current milestone
6. **Start**: Click "Start This Milestone"
7. **Learn**: Focused milestone page experience
8. **Practice**: Complete "Do This Now" activities
9. **Progress**: Log challenges and mark complete
10. **Advance**: Move to next milestone

### **Returning User Journey**

1. **Dashboard**: See all active skills and progress
2. **Continue**: Click "Continue Learning" on any skill
3. **Resume**: Return to current milestone page
4. **Progress**: Continue from where they left off

## 🎨 **Key Features**

### **1. Focused Milestone Pages**

- **Single Purpose**: Each page focuses on one milestone only
- **Clear Content**: Video, tips, and practice in logical order
- **Action-Oriented**: "Do This Now" section is most prominent
- **Progress Tracking**: Must complete practice to advance

### **2. Enhanced Navigation**

- **Breadcrumb Trail**: Always know where you are
- **Global Navigation**: Easy access to main dashboard
- **Skill Switching**: Seamless movement between skills
- **Progress Indicators**: Clear sense of advancement

### **3. Multi-Skill Management**

- **Skill Cards**: Overview of all active skills
- **Progress Summary**: High-level progress for each skill
- **Quick Access**: Continue any skill with one click
- **Skill Library**: Easy addition of new skills

### **4. Improved Practice Experience**

- **Practice Drills**: Professional reframing of reps/sets
- **Progress Logging**: AI-powered error logging
- **Immediate Feedback**: Success messages and recommendations
- **Completion Gate**: Forces active learning

## 🔧 **Technical Implementation**

### **Page Structure**

```
src/app/
├── page.tsx (Main Dashboard - My Forge)
├── skill/
│   ├── [skillId]/
│   │   ├── page.tsx (Skill Overview)
│   │   └── milestone/
│   │       └── [milestoneId]/
│   │           └── page.tsx (Milestone Page)
└── discover/
    └── page.tsx (Skill Library)
```

### **Component Architecture**

```
src/components/
├── dashboard/
│   ├── MainDashboard.tsx
│   ├── SkillCard.tsx
│   └── ProgressOverview.tsx
├── skill/
│   ├── SkillOverview.tsx
│   ├── SkillTree.tsx (enhanced)
│   └── CurrentMilestoneCard.tsx
├── milestone/
│   ├── MilestonePage.tsx (new)
│   ├── MilestoneHeader.tsx
│   ├── CoreLearningSection.tsx
│   ├── DoThisNowBlock.tsx (enhanced)
│   └── ProgressLogging.tsx
└── navigation/
    ├── BreadcrumbTrail.tsx
    ├── GlobalNavigation.tsx
    └── SkillNavigation.tsx
```

## 🔄 **Migration Strategy**

### **Phase 1: Foundation (Week 1-2)**

- Create new page routing structure
- Build Main Dashboard (My Forge)
- Implement global navigation and breadcrumbs
- Set up multi-skill data management

### **Phase 2: Skill Overview (Week 3)**

- Create Skill Overview page
- Enhance SkillTree component
- Build Current Milestone Card
- Implement skill navigation

### **Phase 3: Milestone Pages (Week 4-5)**

- Create dedicated Milestone Page component
- Build Milestone Header and Core Learning Section
- Enhance "Do This Now" Action Block
- Implement Progress Logging

### **Phase 4: Integration & Polish (Week 6)**

- Integrate with existing OpenAI service
- Connect with existing content generation
- Test multi-skill workflows
- Polish UI/UX and responsiveness

## 📈 **Success Metrics**

### **User Engagement**

- **Time on Page**: Increased engagement on milestone pages
- **Completion Rate**: Higher milestone completion rates
- **Return Rate**: More users returning to continue learning
- **Skill Switching**: Users managing multiple skills

### **Learning Effectiveness**

- **Practice Completion**: Higher "Do This Now" completion rates
- **Progress Tracking**: More users logging progress
- **Skill Mastery**: Faster skill acquisition
- **User Satisfaction**: Positive feedback on guided experience

---

**Total Estimated Timeline**: 6 weeks  
**Priority**: High - Core Platform Transformation  
**Impact**: Dramatic improvement in user engagement and learning effectiveness
