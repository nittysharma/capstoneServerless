import './App.css';
import { useState} from 'react'
import ImageGallery from "./components/ImageGallery";
import {Storage } from "aws-amplify";

const config = require("./config.json");

function App() {

  const [searchedMetdata, setSearchMetdata] = useState(0)

  async function onChange(e)
  {
    const file = e.target.files[0];
    const result = await Storage.put(file.name, file)
    console.log("result: ", result + "Request sent successfully.")
  }

  async function searchMetadata(e)
  {
    const searchText = document.getElementById("search").value;
    const response = await fetch(config.OpenSearchUrl.concat(searchText) , {
      method: "get",
      headers: {
        // needed so express parser says the body is OK to read
        'Content-Type': 'application/json'
      }
    });

    var finalResult = "";
    const results = await response.json();
      //fetch hits
      const hitResult = results['hits']['hits'];

      if(hitResult.length > 0 )
      {
        hitResult.forEach(element => {
          finalResult = finalResult + element._id + ",";
        
        });
        setSearchMetdata(finalResult);
      }
      else
      {
        setSearchMetdata("No Record found..");
      }


    // if (response.status !== 200) {
    //   // TODO: Add more detailed error handling.
    //   return alert("Something went wrong.");
    // }
    // else
    // {
    //   //console.log(response);
    //   try{

    //       const data = JSON.parse(response);
    //       setSearchMetdata(data);
    //   }
    //   catch{
    //     // setSearchMetdata(response)
    //   }
      
    // }
    
  }

  return(
    <div>
      <section class="header">
      <div style={{display: 'flex',  justifyContent:'center'}}>
        <h1>Metadata Management</h1>
      </div>
      </section>
      <br/>
      {/* <div style={{display: 'flex',  justifyContent:'center'}}>
        <label>Search Metadata</label> 
        <input id="search" autocomplete="off" placeholder="Search Metadata"></input>
        <button onClick={searchMetadata}>Search</button>
        <label>{searchedMetdata}</label> 
      </div> */}
      <br/>
      <br/>
      <div style={{display: 'flex',  justifyContent:'left'}}>
        <label>Upload Image to Gallery</label>
        <input type="file" onChange={onChange}/>
        </div>  
<div>
  <ImageGallery/>  
</div> 
    </div>
  )
}

export default App;
