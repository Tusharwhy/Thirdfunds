import React,{useState, useEffect} from 'react';
import {DisplayCampaigns} from '../components';
import { useStateContext } from '../context';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);

  //reason for campaign being used in state is because 'mujhe campaigns fetch krne padenge from the smart contracts .
  const [campaigns, setCampaigns] = useState([]);

  const {address, contract, getUserCampaigns} = useStateContext();

  /*the reason we make this async func, is because 'getCampaigns' is an async func and we 
    cannot call an async functions immediately inside of useEffect. 
    we cannot await (await getCampaigns()) and the result of this function (getCampaigns())
    needs to be awaited.
    therefore instead of calling 'getCampaign()' inside useEffect,
    we can call it inside fetchCampaigns.
    and than atlast calling fetchCampaigns() inside useEffect.
  */
  const fetchCampaigns = async () => {
    //before I fetch them
    setIsLoading(true);

    const data = await getUserCampaigns();
    setCampaigns(data);

    //after i fetch them
    setIsLoading(false);
  }

  useEffect(() => {
     if(contract) fetchCampaigns();
  }, [address, contract]);
  return (
    //instead of automatingly looping over our campaigns, We can render our DisplayCampaign component.

    <DisplayCampaigns
      title="All Campaigns"
      isLoading= {isLoading}
      campaigns= {campaigns}
    />
  )
}

export default Profile