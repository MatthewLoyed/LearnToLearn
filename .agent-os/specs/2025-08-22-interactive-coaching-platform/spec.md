# Interactive Coaching Platform - Specification

> **Project**: Skill Forge Evolution  
> **Created**: 2025-08-23
> **Status**: Planning Phase  
> **Priority**: High - Core Platform Transformation

## 🎯 **Executive Summary**

Transform Skill Forge from a static resource library into an interactive, guided coaching platform that provides a step-by-step learning experience. This evolution addresses cognitive overload by creating focused, single-purpose milestone pages with clear progression and navigation.

### **Key Transformation**

- **From**: Single-page roadmap with overwhelming content
- **To**: Multi-page guided walkthrough with focused milestone experiences
- **Result**: Personal coach-like experience that eliminates cognitive overload

## 🏗️ **New Architecture Overview**

### **1. Multi-Page Learning Structure**

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

### **2. Navigation System**

- **Global Navigation**: Persistent "Dashboard" button
- **Breadcrumb Trail**: Dashboard > Skill Name > Milestone Name
- **Skill Cards**: Easy switching between multiple skills
- **Progress Tracking**: Clear indication of current position

## 📱 **Page Structure & User Flow**

### **Phase 1: Entry Point**

1. **Initial Prompt Entry** (existing)
   - User enters skill query (e.g., "how to improve at javascript")
   - System generates skill deconstruction (existing functionality)

### **Phase 2: Skill Overview Page**

2. **Skill Overview Dashboard**
   - **Visual Skill Tree**: Shows all milestones with current position highlighted
   - **Current Milestone Card**: Prominent display of active milestone
   - **Progress Summary**: "Completed X of Y milestones"
   - **Call-to-Action**: "Start This Milestone" or "Continue"
   - **Navigation**: Breadcrumb to main dashboard

### **Phase 3: Milestone Pages**

3. **Dedicated Milestone Experience**
   - **Header**: Clear milestone title and purpose
   - **Core Learning Section**: Focused content for this specific milestone
   - **"Do This Now" Action Block**: Most important, visually distinct section
   - **Progress Logging**: AI-powered error logging
   - **Completion Gate**: Must complete practice to advance

### **Phase 4: Navigation & Multi-Skill Management**

4. **Main Dashboard (My Forge)**
   - **Current Skills Section**: Cards for each active skill
   - **Progress Overview**: High-level progress for each skill
   - **Skill Library**: Add new skills
   - **Quick Navigation**: Continue learning any skill

## 🎨 **UI/UX Design Principles**

### **Visual Hierarchy**

- **Typography**: Bold headings, clear font sizes
- **Color Coding**: Guide user attention to important sections
- **White Space**: Reduce cognitive load, improve readability
- **Consistency**: Same layout across all milestone pages

### **Minimalist Design**

- **Focus on Content**: Eliminate unnecessary graphics/animations
- **Action-Oriented**: "Do This Now" section is most prominent
- **Clean Layout**: Professional, distraction-free experience
- **Mobile-First**: Responsive design for all devices

### **Navigation Patterns**

- **Breadcrumb Trail**: Always visible, clickable navigation
- **Global Navigation**: Persistent access to main dashboard
- **Skill Cards**: Easy switching between multiple skills
- **Progress Indicators**: Clear sense of location and advancement

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

### **Data Flow**

1. **Skill Generation**: Existing OpenAI service generates skill deconstruction
2. **Page Routing**: New routing structure for multi-page experience
3. **Progress Tracking**: Enhanced localStorage for multi-skill management
4. **Navigation State**: Track current skill and milestone across pages

## 📊 **User Experience Flow**

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

## 🎯 **Key Features**

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

### **Technical Performance**

- **Page Load Speed**: Fast loading milestone pages
- **Navigation Efficiency**: Quick movement between pages
- **Data Persistence**: Reliable progress tracking
- **Mobile Experience**: Responsive design performance

## 🚀 **Future Enhancements**

### **Advanced Coaching Features**

- **AI-Powered Recommendations**: Personalized suggestions based on progress logs
- **Adaptive Difficulty**: Adjust milestone difficulty based on user performance
- **Social Learning**: Share progress and challenges with community
- **Gamification**: Achievement system and progress rewards

### **Content Enhancements**

- **Interactive Videos**: Embedded practice within video content
- **Real-Time Feedback**: Immediate validation of practice activities
- **Custom Milestones**: User-generated milestone suggestions
- **Expert Coaching**: Integration with human coaches

## 📋 **Implementation Checklist**

### **Core Infrastructure**

- [ ] Set up new page routing structure
- [ ] Create Main Dashboard component
- [ ] Implement global navigation system
- [ ] Build breadcrumb trail component
- [ ] Set up multi-skill data management

### **Skill Overview**

- [ ] Create Skill Overview page
- [ ] Enhance SkillTree with current position
- [ ] Build Current Milestone Card
- [ ] Implement skill navigation
- [ ] Add progress summary

### **Milestone Pages**

- [ ] Create Milestone Page component
- [ ] Build Milestone Header
- [ ] Create Core Learning Section
- [ ] Enhance "Do This Now" Action Block
- [ ] Implement Progress Logging
- [ ] Add completion gate

### **Integration & Testing**

- [ ] Connect with existing OpenAI service
- [ ] Integrate existing content generation
- [ ] Test multi-skill workflows
- [ ] Mobile responsiveness testing
- [ ] User experience validation

---

**Total Estimated Timeline**: 6 weeks  
**Priority**: High - Core Platform Transformation  
**Impact**: Dramatic improvement in user engagement and learning effectiveness
