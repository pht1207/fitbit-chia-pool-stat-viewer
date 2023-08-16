function fitbitScreenDocumentSettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Required Settings</Text>}>
        <Select
          label={'Coin Type'}
          settingsKey="coin"
          options={[
            {name: 'xch'},
            {name: 'etc'},
            //{name: 'zil'},
            {name: 'iron'},
          ]}
        />
        
        <TextInput
          label="Wallet Address"
          settingsKey="address"
        />
        </Section>
    </Page>
  );
}

registerSettingsPage(fitbitScreenDocumentSettings);
