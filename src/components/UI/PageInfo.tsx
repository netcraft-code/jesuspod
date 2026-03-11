import React from 'react';
import './PageInfo.css';

interface PageInfoProps {
    title: string;
    description: string;
}

const PageInfo: React.FC<PageInfoProps> = ({ title, description }) => {
    return (
        <div className="page-info-section">
            <h1 className="page-info-title">{title}</h1>
            <p className="page-info-description">{description}</p>
        </div>
    );
};

export default PageInfo;
