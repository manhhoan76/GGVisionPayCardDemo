import React from 'react';
import {
  ActivityIndicator,
  Button,
  Clipboard,
  Image,
  PermissionsAndroid,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import uuid from 'uuid';
import Environment from './config/environment';
import firebase from './config/firebase';
import ImagePicker from 'react-native-image-crop-picker';

export default class App extends React.Component {
  state = {
    image: null,
    uploading: false,
    googleResponse: null,
    imageBase64: null,
  };

  async componentDidMount() {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Cool Photo App Camera Permission',
      message:
        'Cool Photo App needs access to your camera ' +
        'so you can take awesome pictures.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
  }

  render() {
    let {image} = this.state;q

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.getStartedContainer}>
            {image ? null : (
              <Text style={styles.getStartedText}>Google Cloud Vision</Text>
            )}
          </View>

          <View style={styles.helpContainer}>
            <Button
              onPress={this._pickImage}
              title="Pick an image from camera roll"
            />

            <View style={{marginVertical: 20}}>
              <Button onPress={this._takePhoto} title="Take a photo" />
            </View>

            <Button onPress={this._scanCard} title="ScanCard a photo" />

            {this.state.googleResponse && (
              <Text style={{color: 'black'}}>{this.state.googleResponse}</Text>
            )}
            {this._maybeRenderImage()}
            {this._maybeRenderUploadingOverlay()}
          </View>
        </ScrollView>
      </View>
    );
  }

  organize = array => {
    return array.map(function (item, i) {
      return (
        <View key={i}>
          <Text>{item}</Text>
        </View>
      );
    });
  };

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}>
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let {image, googleResponse} = this.state;
    if (!image) {
      return;
    }

    return (
      <View
        style={{
          marginTop: 20,
          width: 250,
          borderRadius: 3,
          elevation: 2,
        }}>
        <Button
          style={{marginBottom: 10}}
          onPress={() => this.submitToGoogle()}
          title="Analyze!"
        />

        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: 'rgba(0,0,0,1)',
            shadowOpacity: 0.2,
            shadowOffset: {width: 4, height: 4},
            shadowRadius: 5,
            overflow: 'hidden',
          }}>
          <Image source={{uri: image}} style={{width: 250, height: 250}} />
        </View>
        <Text
          onPress={this._copyToClipboard}
          onLongPress={this._share}
          style={{paddingVertical: 10, paddingHorizontal: 10}}
        />

        <Text>Raw JSON:</Text>

        {googleResponse && (
          <Text
            onPress={this._copyToClipboard}
            onLongPress={this._share}
            style={{paddingVertical: 10, paddingHorizontal: 10}}>
            {JSON.stringify(googleResponse)}
          </Text>
        )}
      </View>
    );
  };

  _keyExtractor = (item, index) => item.id;

  _renderItem = item => {
    <Text>response: {JSON.stringify(item)}</Text>;
  };

  _share = () => {
    Share.share({
      message: JSON.stringify(this.state.googleResponse.responses),
      title: 'Check it out',
      url: this.state.image,
    });
  };

  _copyToClipboard = () => {
    Clipboard.setString(this.state.image);
    alert('Copied to clipboard');
  };

  _takePhoto = async () => {
    let pickerResult = await launchCamera({
      mediaType: 'photo',
      saveToPhotos: true,
      cameraType: 'back',
      quality: 1,
      includeBase64: true,
    });
    console.log({pickerResult});

    this._handleImagePicked(pickerResult);
  };

  _scanCard = async () => {
    const data = await ImagePicker.openPicker({
      width: 856,
      height: 539,
      cropping: true,
      compressImageQuality: 1,
    });
    console.log(data);
    // this._handleImagePicked(pickerResult);
    // setIsLoading(true);
    // const param = {
    //   path: data.path,
    //   grayscale: true, // or true
    //   base64: false, // or true
    //   resizeRatio: 0.8, // 1.0 is origin value
    //   imageQuality: 1, // 1.0 is max quality value
    // };
  };

  _pickImage = async () => {
    let pickerResult = await launchImageLibrary({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 1,
      includeBase64: true,
    });

    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async pickerResult => {
    this.setState({
      image: pickerResult.assets[0].uri,
      imageBase64: pickerResult.assets[0].base64,
    });
  };

  // ---You can use image by uri---
  // image: {
  //   source: {
  //     imageUri: image,
  //   },
  // }
  submitToGoogle = async () => {
    try {
      this.setState({uploading: true});
      let {imageBase64, image} = this.state;
      let body = JSON.stringify({
        requests: [
          {
            features: [
              {
                maxResults: 50,
                model: 'builtin/latest',
                type: 'DOCUMENT_TEXT_DETECTION',
              },
            ],
            image: {
              content: imageBase64,
            },
          },
        ],
      });
      let response = await fetch(
        'https://vision.googleapis.com/v1/images:annotate?key=' +
          Environment['GOOGLE_CLOUD_VISION_API_KEY'],
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: body,
        },
      );
      let responseJson = await response.json();
      console.log({responseJson});
      const fullTextAnnotation = responseJson.responses[0].fullTextAnnotation;
      try {
        fullTextAnnotation.pages.forEach(page => {
          page.blocks.forEach(block => {
            block.paragraphs.forEach(paragraph => {
              paragraph.words.forEach(word => {
                const wordText = word.symbols.map(s => s.text).join('');
                console.log(`Word text: ${wordText}`);
                // word.symbols.forEach(symbol => {
                // });
              });
            });
          });
        });
      } catch (error) {
        console.log(error);
      } finally {
        this.setState({
          uploading: false,
        });
      }
      this.setState({
        googleResponse: responseJson.responses[0].fullTextAnnotation.text,
        uploading: false,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

async function uploadImageAsync(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const ref = firebase.storage().ref().child(uuid.v4());
  const snapshot = await ref.put(blob);

  blob.close();

  return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },

  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },

  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },

  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
});
