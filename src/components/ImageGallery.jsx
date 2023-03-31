import { useState, useEffect} from 'react'
import './ImageGallery.css'
import {Storage} from "aws-amplify";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCircleChevronLeft,
        faCircleChevronRight,
        faCircleXmark, faRefresh} from '@fortawesome/free-solid-svg-icons'

const config = require("../config.json");
 

const AWS = require('aws-sdk');

//TODO change this 
AWS.config.update({
    region: config.AWSRegion}); 

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = config.TableName; 


const ImageGallery = ({}) => {


    const [galleryImages, setgalleryImages] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [selectedCelebrityData, setSelectedCelebrityData] = useState(0)
    const [selectedObjects, setSelectedObjects] = useState(0)
    const [selectedTexts, setSelectedTexts] = useState(0)
    const [piiDataType, setPIIDataType] = useState(0)
    const [openModal, setOpenModel] = useState(false)
    

    const handleOpenModal = (index) => {
        setSelectedIndex(index)
        fetchSelectedImageMetadata(index)
        setOpenModel(true)
    }

    const handleClose = () => {
      setOpenModel(false)
    }

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        if(openModal)
            fetchSelectedImageMetadata(selectedIndex)
        else
            fetchImages()
    
    });

    async function setallCelebrities(celebrityData)
    {
        const response = JSON.parse(celebrityData);
        var celebName = "";

        if(response.length === 0)
        {
            setSelectedCelebrityData("No Celebrity detected");
            return;
        }

        response.forEach(element => {
            celebName = celebName + element.CelebrityName + ",";
          });

          setSelectedCelebrityData(celebName);
    }

    async function setAllObjects(objectsData)
    {
        const response = JSON.parse(objectsData);
        var objectsDetected = "";

        if(response.length === 0)
        {
            setSelectedObjects("No Object detected");
            return;
        }

        response.forEach(element => {
            objectsDetected = objectsDetected + element + ",";
          });

          setSelectedObjects(objectsDetected);
    }

    async function setAllTexts(textData)
    {
        const response = JSON.parse(textData);
        var textDetected = "";

        if(response.length === 0)
        {
            setSelectedTexts("No Text detected");
            return;
        }

        response.forEach(element => {
            textDetected = textDetected + element.DetectedText + ",";
          });

          setSelectedTexts(textDetected);
    }

    async function setPIIInformation(personalData)
    {
        const response = JSON.parse(personalData);
        var piDetected = "";

        if(response.length === 0)
        {
            setPIIDataType("No PII/Sensitive information detected");
            return;
        }

        response.forEach(element => {
            
            piDetected = piDetected + element.Type + ",";
          });

          setPIIDataType(piDetected);
    }

    
    async function fetchSelectedImageMetadata(index)
    {
        // get data from dynamo db 
        const imageKey = 'public/'+ galleryImages[index].Key

        const params = {
            TableName : tableName
            ,
            /* Item properties will depend on your application concerns */
            Key: {
                assetKey: imageKey
            }
        }

        const data = await getItem(params)

        //set data into 
        setallCelebrities(data['CelebrityData']);
        setAllTexts(data['Texts']);
        setAllObjects(data['Objects']);
        setPIIInformation(data['PII']);

        //setSelectedCelebrityData(JSON.stringify(JSON.parse(data['CelebrityData']))) //['CelebrityData']);
        //setSelectedObjects(JSON.stringify(JSON.parse(data['Objects'])))
        // setSelectedTexts(JSON.stringify(JSON.parse(data['Texts'])))
    }

    const prevSlide = () => {
        selectedIndex == 0 ? setSelectedIndex(galleryImages.length -1) : setSelectedIndex(selectedIndex -1)
    }

    const nextSlide = () => {
        selectedIndex ==  galleryImages.length -1 ? setSelectedIndex(0) : setSelectedIndex(selectedIndex +1)
    }
    
    async function getItem(params){
        try {
            
          const data = await (await docClient.get(params).promise()).Item
          return data
        } catch (err) {
          return err
        }
      }


    async function fetchImages() {

        let imagekeys = await Storage.list('');
        console.log('imagekeys 1: ', imagekeys)

        let imagekeys1 = await Promise.all(imagekeys.results.map(async k => {
          const signedUrl = await Storage.get(k.key)
          return {Key: k.key, Url : signedUrl}
        }))
        console.log('imagekeys 2: ', imagekeys1)
        setgalleryImages(imagekeys1);
      }
      
    return (
        <div>

          
            <div className='displayGallery'>
                <FontAwesomeIcon icon={faRefresh} className='refreshImage' onClick={fetchImages}/>
                <label>Refresh Image</label>
                {/* <button onClick={fetchImages}>Click Me</button> */}

            </div>
            { openModal && 
               <div>
                 <div className='sliderWrap'> 
                    <FontAwesomeIcon icon={faCircleXmark} className='btnClose' onClick={handleClose}/>
                    <FontAwesomeIcon icon={faCircleChevronLeft} className='btnPrev' onClick={prevSlide}/>
                    <FontAwesomeIcon icon={faCircleChevronRight} className='btnNext' onClick={nextSlide}/>
                    <div className='fullScreenImage'>
                        <img src={galleryImages[selectedIndex].Url} alt='' width="300" height="300"/>
                    </div>
                </div>
                <div className='metadataInformation'>
                <table border="1">
                    <tr>
                        <th>Description</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Celebrities</td>
                        <td>{selectedCelebrityData}</td>
                    </tr>
                    <tr>
                        <td>Objects</td>
                        <td>{selectedObjects}</td>
                    </tr>
                    <tr>
                        <td>Text Detected</td>
                        <td>{selectedTexts}</td>
                    </tr>
                    <tr>
                        <td>Personal Information Detected</td>
                        <td>{piiDataType}</td>
                    </tr>
                    </table> 
                </div>
                
                </div>
               
            }
            <div className='galleryWrap'>
                {
                   galleryImages && galleryImages.map((image, index) => {
                    return(
                        <div>
                            {/* <label>{image.Key}</label> */}
                        <div className='single' 
                            key={index} 
                            onClick={() => handleOpenModal(index)}>
                            <img src={image.Url} key={image.key} alt={image.Key} className='img' width="150" height="150"/>
                        </div>
                        </div>)
                    }
                )
      /* if(galleryImages !=null)
                {
                    <div id="imageViewer">
                    <p>IMages are</p>
                    <ul>{galleryImages.map((titles) =><li>{titles}</li>)}</ul>
               </div> 
                } */}
                {/* {
                    galleryImages && galleryImages.map((slide,index) => {
                        return(
                            <div className='single' key={index}>
                                <img src={slide[index]} alt=''/>
                            </div>

                        )
                    })
                } */}
            </div>
        </div>
    )
}

export default ImageGallery