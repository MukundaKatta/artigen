import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { colors, typography, spacing } from '@/lib/theme';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.lastUpdated}>Last updated: March 28, 2026</Text>

      <Section title="1. Acceptance of Terms">
        By accessing or using the Artigen application and related services
        (the "Service"), you agree to be bound by these Terms of Service
        ("Terms"). If you do not agree to these Terms, do not use the Service.
      </Section>

      <Section title="2. Description of Service">
        Artigen is an AI art creation and social community platform that allows
        users to generate artwork using artificial intelligence models, share
        creations, interact with other users, participate in challenges and
        communities, and engage in commerce through our marketplace and credit
        system.
      </Section>

      <Section title="3. Account Registration">
        You must create an account to use most features of the Service. You
        agree to provide accurate, current, and complete information during
        registration and to update such information as needed. You are
        responsible for safeguarding your account credentials and for all
        activity that occurs under your account. You must be at least 13 years
        old to create an account.
      </Section>

      <Section title="4. AI-Generated Content">
        <BulletList items={[
          'Content generated through AI models is created based on your text prompts and selected parameters.',
          'AI-generated images may include C2PA provenance metadata for transparency.',
          'You acknowledge that AI models may produce unexpected or imperfect results.',
          'We reserve the right to apply content safety filters to prompts and generated outputs.',
          'You may not use AI generation features to create content that violates these Terms or applicable law, including but not limited to deepfakes of real individuals without consent, child exploitation material, or content that infringes on intellectual property rights.',
        ]} />
      </Section>

      <Section title="5. User Content and Intellectual Property">
        <BulletList items={[
          'You retain ownership of original content you create and upload to the Service.',
          'For AI-generated content, ownership and usage rights are subject to the terms of the underlying AI model providers. You are granted a license to use, share, and commercialize AI-generated content created through the Service, subject to these Terms.',
          'By posting content publicly, you grant Artigen a non-exclusive, worldwide, royalty-free license to display, distribute, and promote your content within the Service.',
          'You represent that you have the right to share any content you upload and that it does not infringe on the rights of any third party.',
        ]} />
      </Section>

      <Section title="6. Community Guidelines">
        You agree not to:
        {'\n\n'}
        <BulletList items={[
          'Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.',
          'Impersonate any person or entity, or falsely state your affiliation.',
          'Upload malware, viruses, or any other harmful code.',
          'Interfere with or disrupt the Service or servers.',
          'Collect or harvest personal information of other users.',
          'Use the Service for spam, phishing, or other fraudulent purposes.',
          'Circumvent content safety filters or moderation systems.',
          'Use automated means to access the Service without our permission.',
        ]} />
      </Section>

      <Section title="7. Credits and Payments">
        <BulletList items={[
          'Artigen uses a credit system for AI generation features. Credits can be purchased through the app.',
          'All credit purchases are final and non-refundable, except as required by applicable law.',
          'Credit prices are subject to change. Existing credit balances are not affected by price changes.',
          'We reserve the right to modify the credit cost of features at any time.',
          'Free credits may be earned through engagement and are subject to expiration policies.',
          'Payment processing is handled by third-party providers (Stripe, Razorpay) subject to their respective terms.',
        ]} />
      </Section>

      <Section title="8. Marketplace">
        <BulletList items={[
          'The marketplace allows users to buy and sell artwork. Artigen acts as a platform facilitator, not a party to transactions between users.',
          'Sellers are responsible for the accuracy of their listings and for fulfilling orders.',
          'Buyers acknowledge that AI-generated artwork may have limitations on exclusivity.',
          'Artigen may charge a platform fee on marketplace transactions.',
          'Disputes between buyers and sellers should be reported to support for mediation.',
        ]} />
      </Section>

      <Section title="9. Subscriptions and Tipping">
        Creator subscriptions and tips are voluntary transactions between users.
        Artigen facilitates these transactions and may retain a platform fee.
        Subscription benefits are determined by creators and are not guaranteed
        by Artigen.
      </Section>

      <Section title="10. Content Moderation">
        We reserve the right to review, remove, or restrict any content that
        violates these Terms or our Community Guidelines. We may use automated
        systems and human review for content moderation. Repeated violations may
        result in account suspension or termination.
      </Section>

      <Section title="11. Intellectual Property">
        The Artigen name, logo, and all related trademarks, service marks, and
        trade names are the property of Artigen. The Service's design, features,
        and functionality are protected by copyright, trademark, and other
        intellectual property laws. You may not copy, modify, or distribute any
        part of the Service without our written permission.
      </Section>

      <Section title="12. Disclaimers">
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
        OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE
        SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. AI-GENERATED
        CONTENT IS PROVIDED WITHOUT WARRANTY OF ACCURACY, QUALITY, OR FITNESS
        FOR A PARTICULAR PURPOSE.
      </Section>

      <Section title="13. Limitation of Liability">
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, ARTIGEN SHALL NOT BE LIABLE FOR
        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
        INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING
        OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL
        NOT EXCEED THE AMOUNT YOU HAVE PAID TO US IN THE TWELVE MONTHS PRECEDING
        THE CLAIM.
      </Section>

      <Section title="14. Indemnification">
        You agree to indemnify, defend, and hold harmless Artigen and its
        officers, directors, employees, and agents from any claims, damages,
        losses, or expenses arising out of your use of the Service, your
        violation of these Terms, or your violation of any rights of a third
        party.
      </Section>

      <Section title="15. Termination">
        We may terminate or suspend your account at any time for any reason,
        including violation of these Terms. Upon termination, your right to use
        the Service ceases immediately. Provisions that by their nature should
        survive termination shall survive, including ownership, warranty
        disclaimers, and limitations of liability.
      </Section>

      <Section title="16. Changes to Terms">
        We may update these Terms from time to time. We will notify you of
        material changes by posting the updated Terms in the app. Your continued
        use of the Service after changes constitutes acceptance of the new Terms.
      </Section>

      <Section title="17. Governing Law">
        These Terms shall be governed by and construed in accordance with the
        laws of the State of California, United States, without regard to its
        conflict of law provisions.
      </Section>

      <Section title="18. Contact">
        For questions about these Terms, please contact us at:
        {'\n\n'}Email: support@artigen.app
      </Section>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.paragraph}>{children}</Text>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <Text key={index} style={styles.bulletItem}>
          {'\u2022'} {item}
          {index < items.length - 1 ? '\n' : ''}
        </Text>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  bulletItem: {
    fontSize: 15,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 24,
    paddingLeft: spacing.sm,
  },
  spacer: {
    height: spacing.xxl,
  },
});
