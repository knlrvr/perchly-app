import { Globe, MessageCircle, Phone, X } from 'lucide-react-native';
import React from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

const RESOURCES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support 24/7',
    phone: '988',
    type: 'phone',
  },
  {
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741',
    phone: '741741',
    type: 'text',
  },
  {
    name: 'National Alliance on Mental Illness',
    description: 'NAMI Helpline: 1-800-950-NAMI',
    phone: '1-800-950-6264',
    type: 'phone',
  },
  {
    name: 'International Association for Suicide Prevention',
    description: 'Find a crisis center in your country',
    url: 'https://www.iasp.info/resources/Crisis_Centres/',
    type: 'web',
  },
];

export default function CrisisModal() {
  const { colors, showCrisisModal, setShowCrisisModal } = useApp();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleText = (number: string) => {
    Linking.openURL(`sms:${number}`);
  };

  const handleWeb = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={showCrisisModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCrisisModal(false)}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <View style={{ width: 32 }} />
            <Text style={[styles.title, { color: colors.text }]}>We're Here For You</Text>
            <TouchableOpacity onPress={() => setShowCrisisModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.messageBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.message, { color: colors.text }]}>
                We noticed you've been having a tough time lately. It's okay to not be okay, and reaching out for help is a sign of strength.
              </Text>
              <Text style={[styles.message, { color: colors.textSecondary, marginTop: 12 }]}>
                If you're struggling, please consider reaching out to one of these resources. You don't have to go through this alone.
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Resources</Text>

            {RESOURCES.map((resource, index) => (
              <View 
                key={index} 
                style={[styles.resourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.resourceInfo}>
                  <Text style={[styles.resourceName, { color: colors.text }]}>{resource.name}</Text>
                  <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                    {resource.description}
                  </Text>
                </View>
                
                {resource.type === 'phone' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.button }]}
                    onPress={() => handleCall(resource.phone!)}
                  >
                    <Phone size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                
                {resource.type === 'text' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.button }]}
                    onPress={() => handleText(resource.phone!)}
                  >
                    <MessageCircle size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                
                {resource.type === 'web' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.button }]}
                    onPress={() => handleWeb(resource.url!)}
                  >
                    <Globe size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={[styles.reminder, { backgroundColor: colors.surface }]}>
              <Text style={[styles.reminderText, { color: colors.textSecondary }]}>
                Remember: Bad days don't last forever. You are valued, and your feelings matter.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
              onPress={() => setShowCrisisModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
  },
  messageBox: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Satoshi-Regular',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  resourceInfo: {
    flex: 1,
    marginRight: 12,
  },
  resourceName: {
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 13,
    fontFamily: 'Satoshi-Regular',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminder: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  reminderText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
    lineHeight: 20,
  },
  closeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
});