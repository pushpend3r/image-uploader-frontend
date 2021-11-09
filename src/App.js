import '@fontsource/raleway/400.css';
import '@fontsource/open-sans/700.css';

import React, { useState } from 'react';
import {
  ChakraProvider,
  Center,
  Box,
  Heading,
  Text,
  Input,
  Progress,
  Button,
  Image,
  VStack,
} from '@chakra-ui/react';
import theme from './theme';
import isFileTypeImage from './utils/isFileTypeImage';
// import { ColorModeSwitcher } from './ColorModeSwitcher';

function App() {
  const [fileToBeUpload, setFileToBeUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [publicFileURL, setPublicFileURL] = useState('');

  const handleFileChange = event => {
    const theFile = event.currentTarget.files[0];
    return isFileTypeImage(theFile) && setFileToBeUpload(theFile);
  };

  const uploadToServer = async (chunk, fileName) => {
    return await fetch('http://localhost:8090/upload', {
      method: 'POST',
      headers: {
        'file-name': fileName,
        'content-type': 'application/octet-stream',
        'content-length': chunk.length,
      },
      body: chunk,
    })
      .then(data => data.text())
      .then(text => text);
  };

  const loadFileToMemory = file => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = async function (e) {
      const CHUNK_SIZE = 50000;
      const TOTAL_CHUCKS = e.target.result.byteLength / CHUNK_SIZE + 1;
      const fileName = Math.random() * 1000 + file.name;

      for (let i = 0; i < TOTAL_CHUCKS; ++i) {
        const chunkToUpload = e.target.result.slice(
          i * CHUNK_SIZE,
          i * CHUNK_SIZE + CHUNK_SIZE
        );

        const response = await uploadToServer(chunkToUpload, fileName);
        // console.log(response);
      }
    };
  };

  const uploading = async () => {
    if (!fileToBeUpload) return;
    setIsUploading(true);
    const form = new FormData();
    form.append('files', fileToBeUpload, fileToBeUpload.name);

    try {
      let response = await fetch('http://localhost:8090/upload', {
        method: 'POST',
        body: form,
      })
        .then(res => {
          return res.json();
        })
        .then(result => result);

      setPublicFileURL(response.publicFileURL);
    } catch (error) {
      alert('Internal Server Error');
      console.log('Internal Server Error');
      setFileToBeUpload(null);
    }
    setIsUploading(false);
  };

  return (
    <ChakraProvider theme={theme}>
      {/* <ColorModeSwitcher /> */}
      <Center h="100vh" color="white">
        <Box>
          <Heading textAlign="center" marginBottom="1.5rem">
            Image Uploader
          </Heading>
          {isUploading && <Progress size="xs" isIndeterminate />}
          {!isUploading && !publicFileURL && (
            <Box maxWidth="container.sm">
              <VStack
                h="200px"
                border="1px"
                align="center"
                justify="space-between"
                onDrop={event => {
                  event.preventDefault();
                  const theFile = event.dataTransfer.files[0];

                  if (isFileTypeImage(theFile)) {
                    setFileToBeUpload(theFile);
                    uploading();
                  } else {
                    alert('Please drag only image files!!');
                  }
                }}
                onDragOver={event => {
                  event.preventDefault();
                }}
              >
                <Text>Drag and Drop Image</Text>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <Button onClick={uploading}>Upload</Button>
              </VStack>
            </Box>
          )}
          {publicFileURL && (
            <VStack align="center">
              <Image
                src={publicFileURL}
                alt="Segun Adebayo"
                boxSize="200px"
                objectFit="cover"
              />
              <a href={publicFileURL}>{publicFileURL}</a>
            </VStack>
          )}
        </Box>
      </Center>
    </ChakraProvider>
  );
}

export default App;
