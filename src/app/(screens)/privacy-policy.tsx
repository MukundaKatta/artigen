import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { colors, typography, spacing } from '@/lib/theme';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.lastUpdated}>Last updated: March 28, 2026</Text>

      <Section title="1. Introduction">
        Artigen ("we," "our," or "us") operates the Artigen mobile application
        and website (collectively, the "Service"). This Privacy Policy explains
        how we collect, use, disclose, and safeguard your information when you
        use our Service. By using Artigen, you agree to the collection and use
        of information in accordance with this policy.
      </Section>

      <Section title="2. Information We Collect">
        <BulletList items={[
          'Account Information: Email address, username, display name, profile picture, and bio when you create an account.',
          'User Content: Images, artwork, prompts, comments, messages, and other content you create or share through the Service.',
          'AI Generation Data: Text prompts, model preferences, generation settings, and resulting AI-generated images.',
          'Usage Data: Interactions with the app including pages viewed, features used, time spent, and engagement metrics.',
          'Device Information: Device type, operating system, unique device identifiers, and mobile network information.',
          'Camera and Photos: Images captured or selected when you use the camera or photo library features.',
          'Audio: Voice messages recorded in direct messaging conversations.',
          'Payment Information: Transaction history and credit balances. Payment card details are processed securely by our third-party payment processors (Stripe and Razorpay) and are not stored on our servers.',
          'Location Data: Approximate location only when you opt into location-based features like Explore Map.',
        ]} />
      </Section>

      <Section title="3. How We Use Your Information">
        <BulletList items={[
          'To provide, maintain, and improve the Service.',
          'To process AI art generation requests using your prompts and settings.',
          'To personalize your experience and content recommendations.',
          'To facilitate social features including messaging, communities, and sharing.',
          'To process payments and manage your credit balance.',
          'To send notifications about activity relevant to you.',
          'To detect, prevent, and address technical issues, fraud, and abuse.',
          'To enforce our Terms of Service and Community Guidelines.',
          'To comply with legal obligations.',
        ]} />
      </Section>

      <Section title="4. AI-Generated Content">
        When you use our AI generation features, your text prompts are sent to
        third-party AI model providers (including but not limited to Replicate,
        HuggingFace, OpenAI, and Google) to generate images. These providers may
        process your prompts according to their own privacy policies. We implement
        content safety checks on all prompts and generated images. AI-generated
        content may include C2PA provenance metadata to promote transparency about
        AI-created artwork.
      </Section>

      <Section title="5. Data Sharing and Disclosure">
        We do not sell your personal information. We may share information with:
        {'\n\n'}
        <BulletList items={[
          'Service Providers: Cloud hosting (Supabase), payment processors (Stripe, Razorpay), AI model providers, and analytics services that help us operate the Service.',
          'Other Users: Your profile information, posts, and public content are visible to other users as part of the social features.',
          'Legal Requirements: When required by law, subpoena, or to protect our rights and safety.',
          'Business Transfers: In connection with a merger, acquisition, or sale of assets.',
        ]} />
      </Section>

      <Section title="6. Data Security">
        We use industry-standard security measures to protect your data,
        including encryption in transit (TLS/SSL), secure authentication via
        Supabase Auth, and access controls on our infrastructure. However, no
        method of transmission over the Internet is 100% secure, and we cannot
        guarantee absolute security.
      </Section>

      <Section title="7. Data Retention">
        We retain your account data for as long as your account is active. You
        may delete your account at any time, which will remove your profile
        information and personal data. Publicly shared content may persist in
        other users' feeds or caches. AI generation history is retained for your
        convenience and can be deleted from your account settings.
      </Section>

      <Section title="8. Your Rights">
        Depending on your jurisdiction, you may have the right to:
        {'\n\n'}
        <BulletList items={[
          'Access and receive a copy of your personal data.',
          'Correct inaccurate personal data.',
          'Request deletion of your personal data.',
          'Object to or restrict processing of your personal data.',
          'Data portability — receive your data in a structured format.',
          'Withdraw consent at any time where processing is based on consent.',
        ]} />
        {'\n'}
        To exercise these rights, contact us at support@artigen.app.
      </Section>

      <Section title="9. Children's Privacy">
        Artigen is not intended for children under 13 years of age. We do not
        knowingly collect personal information from children under 13. If we
        become aware that we have collected such information, we will take steps
        to delete it promptly.
      </Section>

      <Section title="10. Third-Party Links">
        The Service may contain links to third-party websites or services. We
        are not responsible for the privacy practices of these third parties.
        We encourage you to review their privacy policies before providing any
        personal information.
      </Section>

      <Section title="11. Changes to This Policy">
        We may update this Privacy Policy from time to time. We will notify you
        of material changes by posting the new policy in the app and updating
        the "Last updated" date. Your continued use of the Service after changes
        constitutes acceptance of the updated policy.
      </Section>

      <Section title="12. Contact Us">
        If you have questions about this Privacy Policy, please contact us at:
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
