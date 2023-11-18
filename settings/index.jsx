function fitbitScreenDocumentSettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Required Settings</Text>}>        
        <TextInput
          label="Launcher ID"
          settingsKey="launcherID"
        />
        </Section>
    </Page>
  );
}

registerSettingsPage(fitbitScreenDocumentSettings);