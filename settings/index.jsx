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
 {/*}       <Section
        title={<Text bold align="center">Data Display Settings</Text>}>

        <Toggle
          label="Current Effective Hashrate"
          settingsKey="currentEffectiveHash"
        />
        <Toggle
          label="Average Effective Hashrate"
          settingsKey="avgEffectiveHash"
        />
        <Toggle
          label="Reported Hashrate"
          settingsKey="reportedHash"
        />
        <Toggle
          label="Stale Shares Percentage"
          settingsKey="staleSharesPercentage"
        />
        <Toggle
          label="Invalid Share Percentage"
          settingsKey="invalidSharesPercentage"
        />
        </Section>*/}
    </Page>
  );
}

registerSettingsPage(fitbitScreenDocumentSettings);