
//All web 3 logic is stored in here.

import React, {useContext, createContext} from "react";
import {useAddress, useContract, useMetamask, useContractWrite} from '@thirdweb-dev/react';
import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({children}) => {

  //to connect with my smart contract by giving address
  const { contract } = useContract('0x40181aC6e9AF66119570A77DeE1850a1931428D6');

  //this is going to allow me to call a func and create a campaign by passing all the parameters.
  const {mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  //To get Address of smart wallet.
  const address = useAddress();
  const connect = useMetamask();

  //publish campaign
  const PublishCampaign = async (form) => {
    try {
        const data = await createCampaign([
            address,                          //of owner
            form.title,                       //title
            form.description,                 //desc
            form.target,
            new Date(form.deadline).getTime(), //deadline
            form.image
        ])

        console.log("contract call success",data)
        
    } catch (error) {
        
        console.log("contract call failure",error)  
    }
  }

  //to get all campaigns
  const getCampaigns = async () => {
    const campaigns = await contract.call('getCampaigns');

    /*we get an array of nine different elements like amount collected, image, deadline, owner etc.
      in an indexed order. So to get it in nice readable format:-
    */
   const parsedCampaigns = campaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
        image: campaign.image,
        //project id will be index of the campaign.
        pId: i
   }));

   return parsedCampaigns;
  }

  //to get campaigns from logged in user
  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();
    
   //if campaign.owner equal to address of the currently logged in account only then keep it and finaly return filtered.
    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

    return filteredCampaigns;
  }

  /*function for donating*/
  const donate = async (pId, amount) => {
    const data = await contract.call('donateToCampaign', pId, {value: ethers.utils.parseEther(amount)});
    return data;
  }

  /*function to get all donations */
  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', pId);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++){
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;

  }
  return(
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: PublishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations
        }}>

            {children}

    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);