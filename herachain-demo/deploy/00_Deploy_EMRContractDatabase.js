const { getNamedAccounts, deployments, network } = require('hardhat');
const {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require('../helper-hardhat-config');
const { autoFundCheck, verify } = require('../helper-functions');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let additionalMessage = '';
    //set log level to ignore non errors
    ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

    if (chainId == 31337) {
        let linkToken = await get('LinkToken');
        let MockOracle = await get('MockOracle');
        linkTokenAddress = linkToken.address;
        oracle = MockOracle.address;
        additionalMessage = ' --linkaddress ' + linkTokenAddress;
    } else {
        linkTokenAddress = networkConfig[chainId]['linkToken'];
        oracle = networkConfig[chainId]['oracle'];
    }
    const jobId = ethers.utils.toUtf8Bytes(networkConfig[chainId]['jobId']);
    const oracleFee = networkConfig[chainId]['fee'];
    const minimumBet = 1000000000000000;
    const serviceFee = 1000000000000000;
    const interval = 120;
    const weth = networkConfig[chainId]['weth'];
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS
    const args = [minimumBet, interval, linkTokenAddress, oracle, jobId, oracleFee, serviceFee, weth]
    const betGame = await deploy("BetGame", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log('Verifying...');
        await verify(betGame.address, args);
    }

    // Checking for funding...
    if (networkConfig.fundAmount && networkConfig.fundAmount > 0) {
        log('Funding with LINK...');
        if (
            await autoFundCheck(
                betGame.address,
                network.name,
                linkTokenAddress,
                additionalMessage
            )
        ) {
            await hre.run('fund-link', {
                contract: betGame.address,
                linkaddress: linkTokenAddress,
            });
        } else {
            log('Contract already has LINK!');
        }
    }

    log('Run API Consumer contract with following command:');
    const networkName = network.name == 'hardhat' ? 'localhost' : network.name;
    log(
        `yarn hardhat request-data --contract ${betGame.address} --network ${networkName}`
    );
    log('----------------------------------------------------');
};
module.exports.tags = ['all', 'api', 'main'];