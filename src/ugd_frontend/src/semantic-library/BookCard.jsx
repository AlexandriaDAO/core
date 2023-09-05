// BookCard.tsx
import React from 'react';
import { Card, Image, Typography, List, Space, Tooltip, Button } from 'antd';


const { Title, Text, Paragraph } = Typography;

const BookCard = ({ 
    title, 
    currentAuthor, 
    heading, 
    bookImagePath, 
    authorImagePath, 
    imageError, 
    handleImageError, 
    handleReadBookClick,
    isFlipped,
    toggleFlipped,
    summaries,
    contents
}) => {

    return (
        <Card style={{ width: '100%', marginTop: '30px', marginBottom: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <div key={title} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div>
                    <Title level={4} style={{ marginBottom: '15px' }}>{title}</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '25px', textAlign: 'center' }}>
                        <em>{currentAuthor?.id} | Page {heading}</em>
                    </Text>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Read Book">
                            <Image 
                                src={imageError[title] ? (authorImagePath || `/fallbackimage.png`) : bookImagePath}                                alt={title} 
                                onError={() => handleImageError(title)}
                                width={250}
                                height={250}
                                style={{ cursor: 'pointer', borderRadius: '4px' }}
                                onClick={() => handleReadBookClick(currentAuthor.id, title)}
                                preview={false}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
                        <span style={{ margin: '0 10px', color: '#888', fontSize: '0.8rem' }}>Key Sentences</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
                    </div>
                    <List
                        size="small"
                        dataSource={summaries}
                        renderItem={sentence => <List.Item>{(sentence).trim()}</List.Item>}
                    />
                </div>
            </div>
            {isFlipped &&
                <>
                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
                        <span style={{ margin: '0 10px', color: '#888', fontSize: '0.8rem' }}>Book Section</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
                    </div>
                    <div style={{ width: '100%', marginTop: '5px', marginBottom: '25px' }}>
                        <Paragraph>{contents}</Paragraph>
                        <Space>
                            <Button onClick={() => toggleFlipped()}>Show Key Sentences</Button>
                        </Space>
                    </div>
                </>
            }
            {!isFlipped &&
                <Space style={{ display: 'block', textAlign: 'right', width: '100%' }}>
                    <Button onClick={() => toggleFlipped()}>Show Whole Book Section</Button>
                </Space>
            }
        </Card>
    );
}

export default BookCard;
