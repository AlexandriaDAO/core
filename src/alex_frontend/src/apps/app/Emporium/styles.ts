import styled from "styled-components";

export const Paginate = styled.div<{ $isOpen?: boolean }>`
  .pagination {
    display: flex;
    list-style: none;
    justify-content: center;
    padding: 0;
  }

  .pagination li {
    margin: 0 5px;
  }

  .pagination li a {
    padding: 8px 12px;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    color: #0F172A
    background:white
    text-decoration: none;
    cursor: pointer;
    @media (max-width: 767px) {
      font-size: 11px;
      padding: 5px 7px;
    }
  }

 

  .pagination .selected a {
    background: #353230;
    color: #fff;
  }
    .dark .pagination .selected a{
      background: white;
      color: #0f172A;
     } 


  .pagination .disabled a {
    color: hsl(var(--muted-foreground));
    cursor: not-allowed;
  }

  .previous a {
    border: none !important;
  }

`;


