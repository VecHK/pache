module.exports = (cliName, preList = []) => argv => {
  preList.forEach(preName => {
    try {
      require(`../pre-argv/${preName}`)(argv)
    } catch (err) {
      console.error('pre-argv fail.')
      console.error(err)
      process.exit(-1)
    }
  })
  try {
    if (typeof(cliName) === 'function') {
      cliName(argv)
    } else {
      return require(`../cmd/${cliName}`)(argv)
    }
  } catch (err) {
    console.error('未知错误:', err)
    process.exit(-1)
  }
}
