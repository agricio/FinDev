import React,  { useEffect, useState } from 'react';
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../services/api';
import { connect, disconnect, subscribeToNewDevs } from '../services/socket';
function Main({ navigation }){
 
    const [techs, setTechs] = useState('');
    const [devs, setDevs] = useState([]);
    const [mapLoc, setMapLoc] = useState({
        center:{
            latitude: 0,
            longitude: 0
        },
        zoom: 13,
        pitch:0,
        altitude:0,
        heading: 0
    });
  
    useEffect(() => {
            GetMyCurretPosition();
    }, []);

    useEffect(() => {
        subscribeToNewDevs(dev =>setDevs([...devs, dev]));
     }, [devs]);


    const GetMyCurretPosition = () => {
        Geolocation.getCurrentPosition((info) =>{
            const loc = {
                center:{
                    latitude:info.coords.latitude,
                    longitude:info.coords.longitude
                },
                zoom:13,
                pitch:0,
                altitude:0,
                heading:0
            };

            setMapLoc(loc);

        }, (error) => {

        });

    }

    function setupWebsocket(){
        disconnect();

        let longitude = mapLoc.center.longitude;
        let latitude = mapLoc.center.latitude;

        connect(
            latitude,
            longitude,
            techs,
        );
    }

    async function loadDevs(){
        var longitude = mapLoc.center.longitude;
        var latitude = mapLoc.center.latitude;
        const response = await api.get('/search', {
            params: {
                latitude, 
                longitude, 
                techs
            }
        });

        setDevs(response.data.devs);
        setupWebsocket();
    }

    async function loadDevsAll(){
        const response = await api.get('/devs');
        setDevs(response.data);
    }



    function handleRegionChanged(region) {
        //setMapLoc2(region);
        console.log(mapLoc);
    
    }

    return (
      <> 
       <MapView  style = {styles.map} provider="google" camera={mapLoc}>

       <>    
         {devs.map(dev =>(
               
               <Marker key={dev._id} coordinate={{ longitude: dev.location.coordinates[0] , latitude: dev.location.coordinates[1] }}>
                   
                   <Image  style = {styles.avatar} source={{uri: dev.avatar_url}}/>
                   <Callout onPress={()=>{navigation.navigate('Profile', { gitHub_username: dev.github_username })}}>
                       <View style = {styles.callout}>
                           <Text style = {styles.devname}>{dev.name}</Text>
                           <Text style = {styles.devbio}>{dev.bio}</Text>
                           <Text style = {styles.devtechs}>{dev.techs.join(', ')}</Text>
                       </View>
                   </Callout>
               </Marker>
          ))}
              
        </>
       </MapView>
       <View style={styles.serachForm}>
       <TouchableOpacity onPress={(dev)=>{ loadDevsAll() }} style={styles.loadAllButton}>
       <Icon name="retweet" size={20} color="#FFF" />
            <Text>All</Text>
       </TouchableOpacity>
         <TextInput
             style={styles.serachInput}
             placeholder="Buscar Devs por Techs ..."
             placeholderTextColor="#999"
             autoCapitalize= "words"
             autoCorrect= {false}
             value={techs}
             onChangeText={setTechs}
       />
       <TouchableOpacity onPress={(dev)=>{ loadDevs() }} style={styles.loadButton}>
            <Icon name="refresh" size={20} color="#FFF" />
       </TouchableOpacity>
       </View>
     </>
    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    avatar: {
        width: 54,
        height:54,
        borderRadius: 100,
        borderWidth: 4,
        borderColor: '#585050',
    },
    callout:{
        width: 260,
        borderRadius: 10,
    },
    devname:{
        fontWeight: 'bold',
        fontSize: 16,
    },
    devbio:{
        color:'#666',
        marginTop: 5,
    },
    devtechs:{
        marginTop: 5,
    },
    serachForm:{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row',
    },
    serachInput:{
        flex: 1,
        height: 50,
        textAlign: 'center',
        backgroundColor: '#FFF',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16, 
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4,
        },
        elevation: 2,
    },
    loadButton:{
        width: 50,
        height: 50,
        backgroundColor: '#8E4Dff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
    },
    loadAllButton:{
        width: 50,
        height: 50,
        backgroundColor: '#8a73f3',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    }

})

export default Main; 