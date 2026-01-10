import { Award, Calendar, Edit2, Flame, TrendingUp, Trophy, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Badge, MOOD_COLORS, MOOD_IMAGES, MOOD_ORDER, useApp } from '../../context/AppContext';

export default function ProfileTab() {
  const { 
    colors, 
    profile, 
    updateProfile, 
    streak, 
    badges, 
    getAnalytics,
  } = useApp();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [editName, setEditName] = useState(profile?.name || '');

  const analytics = getAnalytics();
  const unlockedBadges = badges.filter(b => b.unlockedAt);
  const lockedCount = badges.filter(b => !b.unlockedAt).length;

  const handleSaveProfile = async () => {
    await updateProfile({
      name: editName,
      createdAt: profile?.createdAt || new Date().toISOString(),
    });
    setShowEditModal(false);
  };

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowBadgeModal(true);
  };

  const getMoodPercentage = (mood: string) => {
    const total = Object.values(analytics.moodCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round((analytics.moodCounts[mood] / total) * 100);
  };

  const getDayOfWeekAverage = (day: string) => {
    const data = analytics.dayOfWeekAverages[day];
    if (!data || data.count === 0) return null;
    return (data.total / data.count).toFixed(1);
  };

  const moodValueToLabel = (value: number) => {
    if (value >= 4.5) return 'Great';
    if (value >= 3.5) return 'Good';
    if (value >= 2.5) return 'Ok';
    if (value >= 1.5) return 'Not Good';
    return 'Bad';
  };

  const formatBadgeDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header / Name */}
        <View style={styles.header}>
          <Image source={MOOD_IMAGES.good} style={styles.avatar} />
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              {profile?.name || 'Perchly User'}
            </Text>
            <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
              {profile?.createdAt 
                ? `Member since ${new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                : 'Welcome to Perchly!'
              }
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              setEditName(profile?.name || '');
              setShowEditModal(true);
            }}
          >
            <Edit2 size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Flame size={24} color="#ff9500" />
            <Text style={[styles.statValue, { color: colors.text }]}>{streak.current}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Current Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Trophy size={24} color="#ffd700" />
            <Text style={[styles.statValue, { color: colors.text }]}>{streak.longest}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Calendar size={24} color={colors.button} />
            <Text style={[styles.statValue, { color: colors.text }]}>{streak.totalDays}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Days Logged</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TrendingUp size={24} color="#34c759" />
            <Text style={[styles.statValue, { color: colors.text }]}>{analytics.totalNotes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Notes Written</Text>
          </View>
        </View>

        {/* Mood Distribution */}
        {streak.totalDays > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood Distribution</Text>
            <View style={styles.moodDistribution}>
              {MOOD_ORDER.map(mood => {
                const percentage = getMoodPercentage(mood!);
                return (
                  <View key={mood} style={styles.moodBar}>
                    <Image source={MOOD_IMAGES[mood!]} style={styles.moodBarIcon} />
                    <View style={[styles.moodBarTrack, { backgroundColor: colors.empty }]}>
                      <View 
                        style={[
                          styles.moodBarFill, 
                          { 
                            backgroundColor: MOOD_COLORS[mood!],
                            width: `${percentage}%`,
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.moodBarPercent, { color: colors.textSecondary }]}>
                      {percentage}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Day of Week Insights */}
        {streak.totalDays >= 7 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Patterns</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Your average mood by day of week
            </Text>
            <View style={styles.weekGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
                const avg = getDayOfWeekAverage(day);
                return (
                  <View key={day} style={styles.weekDay}>
                    <Text style={[styles.weekDayLabel, { color: colors.textSecondary }]}>{day}</Text>
                    {avg ? (
                      <>
                        <Text style={[styles.weekDayValue, { color: colors.text }]}>{avg}</Text>
                        <Text style={[styles.weekDayMood, { color: colors.textMuted }]}>
                          {moodValueToLabel(parseFloat(avg))}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.weekDayValue, { color: colors.textMuted }]}>—</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Badges */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Badges</Text>
          
          {unlockedBadges.length > 0 ? (
            <View style={styles.badgesGrid}>
              {unlockedBadges.map(badge => (
                <TouchableOpacity 
                  key={badge.id} 
                  style={[styles.badge, { backgroundColor: colors.background }]}
                  onPress={() => handleBadgePress(badge)}
                >
                  <View style={[styles.badgePlaceholder, { borderColor: colors.button }]}>
                    <Award size={24} color={colors.button} />
                  </View>
                  <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={1}>
                    {badge.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={[styles.noBadgesText, { color: colors.textMuted }]}>
              No badges unlocked yet. Keep logging!
            </Text>
          )}

          {lockedCount > 0 && (
            <Text style={[styles.lockedCount, { color: colors.textMuted }]}>
              {lockedCount} more badge{lockedCount > 1 ? 's' : ''} to unlock
            </Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={handleSaveProfile}>
                <Text style={[styles.modalSave, { color: colors.button }]}>Save</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Your Name</Text>
            <TextInput
              style={[
                styles.nameInput,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              value={editName}
              onChangeText={setEditName}
              maxLength={30}
            />
          </View>
        </View>
      </Modal>

      {/* Badge Detail Modal */}
      <Modal
        visible={showBadgeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowBadgeModal(false)}
        >
          <View style={[styles.badgeModalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.badgeModalIcon, { borderColor: colors.button }]}>
              <Award size={40} color={colors.button} />
            </View>
            <Text style={[styles.badgeModalName, { color: colors.text }]}>
              {selectedBadge?.name}
            </Text>
            <Text style={[styles.badgeModalDesc, { color: colors.textSecondary }]}>
              {selectedBadge?.description}
            </Text>
            {selectedBadge?.unlockedAt && (
              <Text style={[styles.badgeModalDate, { color: colors.textMuted }]}>
                Unlocked {formatBadgeDate(selectedBadge.unlockedAt)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Satoshi-Bold',
  },
  memberSince: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Satoshi-Black',
    marginTop: 8,
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    marginTop: 2,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Regular',
    marginBottom: 16,
  },
  moodDistribution: {
    marginTop: 12,
    gap: 12,
  },
  moodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodBarIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  moodBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  moodBarPercent: {
    width: 40,
    textAlign: 'right',
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    flex: 1,
  },
  weekDayLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 8,
  },
  weekDayValue: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
  },
  weekDayMood: {
    fontSize: 10,
    fontFamily: 'Satoshi-Regular',
    marginTop: 2,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  badge: {
    width: '30%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  badgePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
  },
  noBadgesText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    marginTop: 12,
  },
  lockedCount: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
  },
  modalSave: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 8,
  },
  nameInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
  },
  badgeModalContent: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  badgeModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeModalName: {
    fontSize: 22,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeModalDesc: {
    fontSize: 15,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  badgeModalDate: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    marginTop: 16,
  },
});