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
  Flex,
  Spacer,
} from '@chakra-ui/react';
import theme from './theme';
import isFileTypeImage from './utils/isFileTypeImage';
// import { ColorModeSwitcher } from './ColorModeSwitcher';

function App() {
  const [fileToBeUpload, setFileToBeUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [publicFileURL, setPublicFileURL] = useState('');

  console.log(process.env.REACT_APP_BACKEND_URL);

  const handleFileChange = event => {
    const theFile = event.currentTarget.files[0];
    return isFileTypeImage(theFile) && setFileToBeUpload(theFile);
  };

  // const uploadToServer = async (chunk, fileName) => {
  //   return await fetch('http://localhost:8090/upload', {
  //     method: 'POST',
  //     headers: {
  //       'file-name': fileName,
  //       'content-type': 'application/octet-stream',
  //       'content-length': chunk.length,
  //     },
  //     body: chunk,
  //   })
  //     .then(data => data.text())
  //     .then(text => text);
  // };

  // const loadFileToMemory = file => {
  //   const fileReader = new FileReader();
  //   fileReader.readAsArrayBuffer(file);
  //   fileReader.onload = async function (e) {
  //     const CHUNK_SIZE = 50000;
  //     const TOTAL_CHUCKS = e.target.result.byteLength / CHUNK_SIZE + 1;
  //     const fileName = Math.random() * 1000 + file.name;

  //     for (let i = 0; i < TOTAL_CHUCKS; ++i) {
  //       const chunkToUpload = e.target.result.slice(
  //         i * CHUNK_SIZE,
  //         i * CHUNK_SIZE + CHUNK_SIZE
  //       );

  //       const response = await uploadToServer(chunkToUpload, fileName);
  //       // console.log(response);
  //     }
  //   };
  // };

  const uploading = async () => {
    if (!fileToBeUpload) return;
    setIsUploading(true);
    const form = new FormData();
    form.append('files', fileToBeUpload, fileToBeUpload.name);

    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/upload`,
        {
          method: 'POST',
          body: form,
        }
      )
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
              <Flex
                h="300px"
                border="1px"
                direction="column"
                alignItems="center"
                padding="0.5rem"
                borderRadius="2px"
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
                <Center flex="1">
                  <Text>Drag and Drop Image</Text>
                </Center>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{
                    border: '1px solid white',
                    borderRadius: '2px',
                    padding: '0.5rem',
                  }}
                />
                <Button onClick={uploading} marginTop="1rem">
                  Upload
                </Button>
              </Flex>
            </Box>
          )}
          {publicFileURL && (
            <Flex
              direction="column"
              alignItems="center"
              padding="0.5rem"
              borderRadius="2px"
            >
              <Image
                src={publicFileURL}
                alt="Segun Adebayo"
                boxSize="300px"
                objectFit="cover"
              />
              <a
                href={publicFileURL}
                style={{
                  marginTop: '1rem',
                  fontWeight: 'bolder',
                  fontSize: '1.25rem',
                }}
              >
                {publicFileURL}
              </a>
            </Flex>
          )}
        </Box>
      </Center>
    </ChakraProvider>
  );
}

export default App;
