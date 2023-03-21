// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//solidity is strictly typed language.

contract MyContract {
    struct Campaign{   //it's like object in javascript.
        
        address owner;
        string title;
        string description;

        // uint256 is number. target amount which want to achieve.
        uint256 target; 

        uint256 deadline;         
        uint256 amountCollected;

        // image is string becuase we're going to put url.
        string image;

        // array of address for addressess of donators.
        address[] donators;

        // array of actual number of amounts of our donations.
        uint256[] donations;         

    }
    
    // I created mappings that now I can use it on campaign.
    mapping(uint256 => Campaign) public campaigns;

    // Global variable. so that I can keep track number of campaign created, to give them IDs.
    uint256 public numberOfCampaigns = 0;



    // Functionality:-


    /* 1. function to create campaign.
    - as parameters are only for this specific function i used underscore.
    - memory keyword is needed with every single string.
    - In solidity we need to specify if this func is only internal
      or if we can use it from our frontend as this one is going to be public
      I used public keyword. 
    */

    function createCampaign(
        address _owner, 
        string memory _title, 
        string memory _description, 
        uint256 _target, 
        uint256 _deadline, 
        string memory _image) public returns(uint256) {

        Campaign storage campaign = campaigns[numberOfCampaigns];

        // require in solidity is like a check. if everything is okay?
        require(campaign.deadline < block.timestamp, "The deadline should be a date in the future");

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        //to increment the number of campaigns.
        numberOfCampaigns ++;
        
        // this would be the index of most latest created campaign.
        return numberOfCampaigns -1;
        
    }


    /* 2. function to donate to campaign.
    - (_id) i need the id of campaign to donate the money to. 
    - its going to be public obviously. 
    - special keyword 'payable' that signifies that we are going to send 
      crytoCurrency throughout this function.
    */
    function donateToCampaign(uint256 _id) public payable {

        // this is we are going to send from our front end.
        uint256 amount = msg.value;
        
        // then I want the campaign to donate
        Campaign storage campaign = campaigns[_id];

        // to push the address of the person that donated also the amount.
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);
        
        // to make the transaction
        (bool sent,) = payable(campaign.owner).call{value: amount}("");

        if(sent){
            campaign.amountCollected = campaign.amountCollected + amount;
        }

    }

    /* 3. function to get donators for campaign, gives me a list of people who donated.
    - to be able to get donators i need to know of which campaign i need donators from,
      thats why i need to pass _id. 
    - also 'view' function inly lets me view the data */
    function getDonators(uint256 _id) view public returns(address[] memory, uint256[] memory) {

        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    // 4. function to get a list of all campaigns.
    function getCampaigns() public view returns (Campaign[] memory) {

        /* so i created a new variable 'allCampaigns' which is of a type of 
           'array of multiple Campaign structures'. 
           so in this case I'm creating empty array with as many
           empty elements as there are actual campaigns(numberOfCampaigns)
           so now we have empty array of that many empty structs
           as we have actuall campaigns created [{}, {}, {}]*/
        Campaign[] memory allCampaigns = new Campaign[] (numberOfCampaigns);

        for(uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item =  campaigns[i];

            allCampaigns[i] = item;
        }

        return allCampaigns;
    }


}